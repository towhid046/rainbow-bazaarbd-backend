import { Request, Response } from "express";
import { Product } from "../models/Product.model";
import { productZodSchema } from "../schemas/Product.schema";
import { Category } from "../models/Category.model";

/**
 * GET ALL PRODUCTS
 */
export const getAllProductsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      flash,
      featured,
      sort
      ,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query: any = {};
    if (req.query.isActive === "true") {
      query.isActive = true;
    } else if (req.query.isActive === "false") {
      query.isActive = false;
    } else if (req.query.isActive === "all") {
      // Do not filter by isActive, show all products
    } else {
      // Default to active only for shop routes
      query.isActive = true;
    }

    /**
     * SEARCH
     */
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    /**
     * CATEGORY FILTER
     */
    if (category) {
      query.category = category; // Changed query target to category
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
/**
 * SORTING
 */
    let sortOption: any = {};

    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "best-selling") {
      sortOption = { soldCount: -1 };
    } else if (sort === "top-rated") {
      sortOption = { rating: -1 };
    } else {
      // Default sorting if no match or no sort parameter is provided
      sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "_id name") // Automatically resolves to category: { _id, name }
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
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "_id name");

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
): Promise<void> => {
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

    // Increments counter using validatedData.category
    if (validatedData.category) {
      await Category.findByIdAndUpdate(validatedData.category, {
        $inc: { items: 1 }
      });
    }

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
): Promise<void> => {
  try {
    const validatedData = productZodSchema.partial().parse(req.body);

    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );

    // Handle count adjustments matching the updated field name
    if (
      validatedData.category && 
      oldProduct.category?.toString() !== validatedData.category
    ) {
      // Decrease old category count
      await Category.findByIdAndUpdate(oldProduct.category, { $inc: { items: -1 } });
      // Increase new category count
      await Category.findByIdAndUpdate(validatedData.category, { $inc: { items: 1 } });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
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
): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Decrement using product.category
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $inc: { items: -1 }
      });
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
