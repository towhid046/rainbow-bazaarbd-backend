import { Request, Response } from "express";
import { PreOrder } from "../models/PreOrder.model";

// GET /get-count
export const getPreOrderCountHandler = async (req: Request, res: Response) => {
  try {
    const count = await PreOrder.countDocuments();
    res.status(200).json({ count });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pre-order count", error: err.message });
    return;
  }
};

// GET /
export const getAllPreOrderHandler = async (req: Request, res: Response) => {
  const { limit = "10", skip = "0", search } = req.query;

  try {
    const filter: Record<string, any> = {};
    if (search) {
      const regex = { $regex: String(search), $options: "i" };
      filter.$or = [
        { studentName: regex },
        { studentNumber: regex },
        { bookName: regex },
      ];
    }
    const list = await PreOrder.find(filter)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    res.status(200).json(list);
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pre-orders", error: err.message });
    return;
  }
};

// GET /:id
export const getSinglePreOrderHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "PreOrder ID is required" });
    return;
  }

  try {
    const preOrder = await PreOrder.findById(id);
    if (!preOrder) {
      res.status(404).json({ message: "PreOrder not found" });
      return;
    }

    res.status(200).json(preOrder);
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pre-order", error: err.message });
    return;
  }
};

// POST /
export const createPreOrderHandler = async (req: Request, res: Response) => {
  try {
    const { totalAmount, paidAmount } = req.body;

    let remainingDue = 0;
    if(Number(totalAmount) > 0 && Number(paidAmount) > 0) {
      remainingDue = Number(totalAmount) - Number(paidAmount);
    }

    const newPreOrder = new PreOrder({...req.body, remainingDue});
    await newPreOrder.save();

    res.status(201).json(newPreOrder);
    return;
  } catch (err: any) {
    console.error(err);
    if (err.name === "ZodError") {
      res.status(400).json({ errors: err.errors });
      return;
    }

    res.status(500).json({ message: "Error creating pre-order", error: err.message });
    return;
  }
};

// PUT /:id
export const updatePreOrderHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "PreOrder ID is required" });
    return;
  }

  try {
    const updated = await PreOrder.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      res.status(404).json({ message: "PreOrder not found" });
      return;
    }

    res.status(200).json({ message: "PreOrder updated", preOrder: updated });
    return;
  } catch (err: any) {
    console.error(err);
    if (err.name === "ZodError") {
      res.status(400).json({ errors: err.errors });
      return;
    }

    res.status(500).json({ message: "Error updating pre-order", error: err.message });
    return;
  }
};

// DELETE /:id
export const deletePreOrderHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "PreOrder ID is required" });
    return;
  }

  try {
    const deleted = await PreOrder.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "PreOrder not found" });
      return;
    }

    res.status(200).json({ message: "PreOrder deleted" });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Error deleting pre-order", error: err.message });
    return;
  }
};
