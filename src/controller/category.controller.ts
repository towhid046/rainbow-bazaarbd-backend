import { Request, Response } from "express";
import { Category } from "../models/Category.model";
import { categoryZodSchema } from "../schemas/Category.schema";
import { slugBuilder } from "../utils/slugBuilder";

// CREATE
export const createCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = categoryZodSchema.parse(req.body);

    const slug = slugBuilder(validatedData?.name)
    
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      res.status(400).json({ success: false, message: "Category slug already exists" });
      return;
    }

    const category = await Category.create({...validatedData, slug});
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ ALL
export const getAllCategoriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
export const updateCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = categoryZodSchema.partial().parse(req.body);
    let slug;
    if(validatedData?.name){
      slug = slugBuilder(validatedData?.name)
    }
    
    const category = await Category.findByIdAndUpdate(req.params.id, {...validatedData, slug}, { new: true });
    
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};