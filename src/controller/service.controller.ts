import { Request, Response } from "express";
import { Service } from "../models/Service.model";
import { serviceZodSchema } from "../schemas/Service.schema";

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Error fetching services" });
    }
};

// Create a new service
export const createService = async (req: Request, res: Response) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        res.status(400).json({ message: "Error creating service" });
    }
};

// Update a service
export const updateService = async (req: Request, res: Response) => {
    if (!req.params.id) {
        throw new Error("ID is required to update a service")
    }
    try {
        const validateService = serviceZodSchema.parse(req.body)
        const service = await Service.findByIdAndUpdate(req.params.id, validateService, { new: true })
        if (!service) {
            throw new Error("Service not found.")
        }
        res.status(200).json({ message: 'Service updated successfully!', service })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw new Error("ID is required to delete a service")
        }
        const service = await Service.findByIdAndDelete(req.params.id)
        if (!service) {
            throw new Error("Service not found.")
        }
        res.status(200).json({ message: 'service deleted successfully!' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
};
