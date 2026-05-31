// src/controller/order.controller.ts

import { Request, Response } from "express";
import mongoose from "mongoose";

import { Order } from "../models/Order.model";
import { Product } from "../models/Product.model";

import {
  orderStatusEnum,
  orderZodSchema,
} from "../schemas/Order.schema";

// CREATE ORDER
export const createOrderHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const validatedData = orderZodSchema.parse(req.body);

    let calculatedTotal = 0;

    const orderItems = [];

    // PROCESS EACH ITEM
    for (const item of validatedData.items) {
      const product = await Product.findById(
        item.productId
      ).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      // CHECK STOCK
      if (product.stock < item.quantity) {
        throw new Error(
          `${product.name} is out of stock`
        );
      }

      // REDUCE STOCK
      product.stock -= item.quantity;

      await product.save({ session });

      // CALCULATE TOTAL
      calculatedTotal += product.price * item.quantity;

      // SAVE PRODUCT SNAPSHOT
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // CREATE ORDER
    const order = await Order.create(
      [
        {
          name: validatedData.name,
          phone: validatedData.phone,
          zila: validatedData.zila,
          thana: validatedData.thana,
          fullAddress: validatedData.fullAddress,
          note: validatedData.note,

          paymentMethod:
            validatedData.paymentMethod,

          status: validatedData.status,

          items: orderItems,

          total: calculatedTotal,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order[0],
    });
  } catch (error: any) {
    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message:
        error?.errors?.[0]?.message ||
        error.message,
    });
  } finally {
    session.endSession();
  }
};

// GET ALL ORDERS
export const getAllOrdersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
      search,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query: any = {};

    // FILTER BY STATUS
    if (status) {
      query.status = status;
    }

    // SEARCH
    if (search && typeof search === "string") {
      const searchQuery: any[] = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchQuery.push({
          _id: new mongoose.Types.ObjectId(search),
        });
      }

      query.$or = searchQuery;
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ORDER
export const getOrderHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const parsedStatus = orderStatusEnum.parse(
      req.body.status
    );

    const order = await Order.findById(
      req.params.id
    ).session(session);

    if (!order) {
      await session.abortTransaction();

      res.status(404).json({
        success: false,
        message: "Order not found",
      });

      return;
    }

    // RESTORE STOCK WHEN CANCELED
    if (
      parsedStatus === "Canceled" &&
      order.status !== "Canceled"
    ) {
      for (const item of order.items) {
        const product = await Product.findById(
          item.productId
        ).session(session);

        if (product) {
          product.stock += item.quantity;

          await product.save({ session });
        }
      }
    }

    order.status = parsedStatus;

    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    await session.abortTransaction();

    res.status(400).json({
      success: false,
      message:
        error?.errors?.[0]?.message ||
        error.message,
    });
  } finally {
    session.endSession();
  }
};

// DELETE ORDER
export const deleteOrderHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ORDER SUMMARY
export const getOrderSummaryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // TODAY DATE RANGE
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );

    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    /**
     * TOTAL REVENUE (DELIVERED ONLY)
     */
    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    /**
     * TODAY REVENUE (DELIVERED ONLY)
     */
    const todayRevenueResult =
      await Order.aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            todayRevenue: {
              $sum: "$total",
            },
          },
        },
      ]);

    const todayRevenue =
      todayRevenueResult[0]?.todayRevenue || 0;

    /**
     * TOTAL ORDERS
     */
    const totalOrders =
      await Order.countDocuments();

    /**
     * TODAY ORDERS
     */
    const todayOrders =
      await Order.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });

    /**
     * TOTAL PRODUCTS
     */
    const totalProducts =
      await Product.countDocuments();

    /**
     * TODAY ADDED PRODUCTS
     */
    const todayAddedProducts =
      await Product.countDocuments({
        createdAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,

        totalOrders,
        todayOrders,

        totalProducts,
        todayAddedProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};