import { Request, Response } from "express";
import { Product } from "../models/Product.model";
import { productZodSchema } from "../schemas/Product.schema";



/**
 * GET ALL PRODUCTS
 */
export const getAllProductsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      flash,
      featured,
      sort,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query: any = {
      isActive: true,
    };

    /**
     * SEARCH
     */
    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
      query.description = {
        $regex: search,
        $options: "i",
      };
    }

    /**
     * CATEGORY
     */
    if (category) {
      query.categoryId = category;
    }

    /**
     * FLASH SALE
     */
    if (flash === "true") {
      query.isFlash = true;
    }

    /**
     * FEATURED
     */
    if (featured === "true") {
      query.isFeatured = true;
    }

    /**
     * SORTING
     */
    let sortOption: any = {
      createdAt: -1,
    };

    if (sort === "price-asc") {
      sortOption.price = 1;
    }

    if (sort === "price-desc") {
      sortOption.price = -1;
    }

    if (sort === "best-selling") {
      sortOption.soldCount = -1;
    }

    if (sort === "top-rated") {
      sortOption.rating = -1;
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
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



/**
 * GET SINGLE PRODUCT
 */
export const getSingleProductHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * CREATE PRODUCT
 */
export const createProductHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = productZodSchema.parse(req.body);

    const existingSlug = await Product.findOne({
      slug: validatedData.slug,
    });

    if (existingSlug) {
      res.status(400).json({
        success: false,
        message: "Slug already exists",
      });

      return;
    }

    const product = await Product.create(validatedData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * UPDATE PRODUCT
 */
export const updateProductHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = productZodSchema.partial().parse(req.body);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * DELETE PRODUCT
 */
export const deleteProductHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * CART SUMMARY
 */
export const getCartSummaryHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: "Invalid cart items",
      });

      return;
    }

    const ids = items.map((item) => item.id);

    const products = await Product.find({
      _id: {
        $in: ids,
      },
    });

    const summary = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.id
      );

      if (!product) return null;

      return {
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
        stock: product.stock,
        lineTotal: product.price * item.quantity,
      };
    });

    const filteredSummary = summary.filter(Boolean);

    const subtotal = filteredSummary.reduce(
      (acc: number, item: any) => acc + item.lineTotal,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        items: filteredSummary,
        subtotal,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/**
 * PRODUCT COUNT
 */
export const getProductCountHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};