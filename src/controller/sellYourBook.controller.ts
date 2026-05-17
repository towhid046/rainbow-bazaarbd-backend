import { Request, Response } from "express";
import { SellYourBook } from "../models/SellYourBook.model";
import { sellYourBookZodSchema } from "../schemas/SellYourBook.schema";

// Get all sell requests
export const getAllSellRequests = async (req: Request, res: Response) => {
  try {
    const requests = await SellYourBook.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sell requests" });
  }
};

// Get single sell request by ID
export const getSellRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await SellYourBook.findById(id);
    if (!request) { 
        res.status(404).json({ message: "Sell request not found" });
        return;
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sell request" });
  }
};

// Create or update a sell request based on mobile
export const createOrUpdateSellRequest = async (req: Request, res: Response) => {
  try {
    const validated = sellYourBookZodSchema.parse(req.body);
    const existing = await SellYourBook.findOne({ mobile: validated.mobile });
    if (existing) {
      existing.studentName = validated.studentName;
      existing.address = validated.address;
      existing.books = [...existing.books, ...validated.books];
      await existing.save();
      res.status(200).json(existing);
      return;
    }
    const newRequest = new SellYourBook(validated);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Update a sell request by ID
export const updateSellRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required to update a sell request");
    const validated = sellYourBookZodSchema.parse(req.body);
    const updated = await SellYourBook.findByIdAndUpdate(id, validated, { new: true });
    if (!updated) throw new Error("Sell request not found");
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a sell request by ID
export const deleteSellRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required to delete a sell request");
    const deleted = await SellYourBook.findByIdAndDelete(id);
    if (!deleted) throw new Error("Sell request not found");
    res.status(200).json({ message: "Sell request deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};