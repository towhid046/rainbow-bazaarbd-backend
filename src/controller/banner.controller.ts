import { Request, Response } from "express";
import { Banner } from "../models/Banner.model";

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageUrl, isActive, order } = req.body;
    if (!imageUrl) {
      res.status(400).json({ success: false, message: "Image URL is required" });
      return;
    }
    const banner = await Banner.create({ imageUrl, isActive, order });
    res.status(201).json({ success: true, message: "Banner created successfully", data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrl, isActive, order } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      { imageUrl, isActive, order },
      { new: true }
    );

    if (!banner) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Banner updated successfully", data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
