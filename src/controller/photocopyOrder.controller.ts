import { Request, Response } from "express";
import { SheetOrder } from "../models/PhotocopyOrder.model";
import { photocopyOrderZodSchema } from "../schemas/PhotocopyOrder.schema";
import cloudinary from "../config/cloudinary";
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';

interface QueryProp {
  limit?: number;
  skip?: number;
}

export const createSheetOrder = async (req: Request, res: Response) => {
  try {
    if (req.body.lectureSheets) {
      req.body.lectureSheets = JSON.parse(req.body.lectureSheets);
    }

    if (req.body.pdfMeta) {
      const raw = Array.isArray(req.body.pdfMeta) ? req.body.pdfMeta : [req.body.pdfMeta];
      req.body.pdfMeta = raw.map((m: any) => ({
        printType: m.printType as "Black & White" | "Color Print",
        copies: parseInt(m.copies, 10),
      }));
    }

    const validation = photocopyOrderZodSchema.safeParse(req.body);
    if (!validation.success) {
       res.status(400).json({ error: validation.error.errors });
       return;
    }

    const {
      name, phone, address, department, year, semester, lectureSheets, pdfMeta
    } = validation.data;

    const pdfFiles = req.files as Express.Multer.File[];
    const uploadedFiles: {
      url: string;
      public_id: string;
      printType: string;
      copies: number;
    }[] = [];

    if (pdfFiles?.length) {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const meta = pdfMeta?.[i] ?? { printType: "Black & White", copies: 1 };

        if (file.mimetype !== "application/pdf") {
           res.status(400).json({ error: "Only PDF files are allowed." });
           return;
        }

        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "pdfs",
              public_id: `${Date.now()}-${uuidv4()}-${file.originalname}`
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({ secure_url: result!.secure_url, public_id: result!.public_id });
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        uploadedFiles.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          printType: meta.printType,
          copies: meta.copies,
        });
      }
    }

    const newOrder = new SheetOrder({
      name,
      phone,
      address,
      department,
      year,
      semester,
      lectureSheets: lectureSheets?.map((s) => ({ name: s.name })),
      pdfFiles: uploadedFiles,
    });

    await newOrder.save();
     res.status(200).json({ message: "Sheet order created successfully" });
     return;

  } catch (err: unknown) {
    console.error("Error in createSheetOrder:", err);
    const msg = err instanceof Error ? err.message : "Unknown server error";
     res.status(500).json({ error: "Server Error", details: msg });
     return;
  }
};

export const deleteSheetOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await SheetOrder.findById(id);

    if (!order) {
       res.status(404).json({ message: "Order not found" });
       return;
    }

    if (order.pdfFiles?.length > 0) {
      await Promise.all(
        order.pdfFiles.map(async (file) => {
          try {
            await cloudinary.uploader.destroy(file.public_id, {
              resource_type: "raw"
            });
          } catch (error) {
            console.error(`Error deleting ${file.public_id}:`, error);
          }
        })
      );
    }

    await SheetOrder.findByIdAndDelete(id);
     res.status(200).json({ message: "Order and files deleted" });
     return;

  } catch (error: unknown) {
    console.error("Delete Error:", error);
     res.status(500).json({
      error: "Delete Failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
    return;
  }
};

export const getSheetOrderHandler = async (req: Request, res: Response) => {
  const query: QueryProp = {};
  try {
    if (req.query?.limit) {
      const limit = parseInt(req.query.limit as string);
      if (isNaN(limit)) {
         res.status(400).send({ message: "Limit must be a number" });
         return;
      }
      query.limit = limit;
    }

    if (req.query?.skip) {
      const skip = parseInt(req.query.skip as string);
      if (isNaN(skip)) {
         res.status(400).send({ message: "Skip must be a number" });
         return;
      }
      query.skip = skip;
    }

    const orders = await SheetOrder.find()
      .select("-__v -createdAt -updatedAt")
      .limit(query.limit || 0)
      .skip(query.skip || 0);

     res.status(200).send(orders);
     return;

  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
     res.status(400).send({
      message: "Failed to fetch orders",
      error: error instanceof Error ? error.message : "Unknown fetch error"
    });
    return;
  }
};

export const getSheetOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await SheetOrder.findById(id);
    if (!order) {
       res.status(404).send({ message: "Order not found" });
       return;
    }
     res.status(200).send(order);
     return;
  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    res.status(400).send({
      message: "Failed to fetch order",
      error: error instanceof Error ? error.message : "Unknown fetch error"
    });
    return;
  }
};

