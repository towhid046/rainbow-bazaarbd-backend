import { Request, Response } from "express";
import { ZodError } from "zod";
import { Customer } from "../models/Customer.model";
import { customerZodSchema } from "../schemas/Customer.Schema";

// Get customer count
export const getCustomerCountHandler = async (req: Request, res: Response) => {
    try {
        const count = await Customer.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer count", error: error instanceof Error ? error.message : error });
    }
};

// Get all customers
export const getAllCustomerHandler = async (req: Request, res: Response) => {
      const { limit = "10", skip = "0", search } = req.query;
    
      try {
        const filter: Record<string, any> = {};
        if (search) {
          const regex = { $regex: String(search), $options: "i" };
          filter.$or = [
            { name: regex },
            { phone: regex },
            { department: regex },
          ];
        }
        const customers = await Customer.find(filter)
          .limit(Number(limit))
          .skip(Number(skip))
          .sort({ createdAt: -1 });
    
        res.status(200).json(customers);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching customers", error: error instanceof Error ? error.message : error });
    }
};

// Get single customer
export const getSingleCustomerHandler = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer", error: error instanceof Error ? error.message : error });
    }
};

// Create customer with initial transaction
export const createCustomerHandler = async (req: Request, res: Response) => {
    try {
        const { balance, note } = req.body;
        const validatedData = customerZodSchema.parse({
            ...req.body,
            balance: Number(balance),
            transactions: [
                {
                    type: "credit",
                    amount: Number(balance),
                    note: note || "Initial deposit",
                },
            ],
        });

        const existingCustomer = await Customer.findOne({ phone: validatedData.phone });
        if (existingCustomer) {
            res.status(400).json({ message: "Customer already exists with this phone number" });
            return;
        }

        const customer = await Customer.create(validatedData);
        res.status(201).json(customer);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ message: "Validation error", error: error.errors });
            return;
        }
        res.status(500).json({ message: "Error creating customer", error: error instanceof Error ? error.message : error });
    }
};

// Update customer details
export const updateCustomerHandler = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        const newCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            { ...req.body},
            { new: true, runValidators: true }
        )
        
        res.status(200).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error: error instanceof Error ? error.message : error });
    }
};

// Update customer balance with transaction
export const updateCustomerTransactionHandler = async (req: Request, res: Response) => {
    try {
        const { type, amount, note } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        const numericAmount = Number(amount);

        if (type === "credit") {
            customer.balance += numericAmount;
        } else if (type === "debit") {
            if (numericAmount > customer.balance) {
                res.status(400).json({ message: "Insufficient balance" });
                return;
            }
            customer.balance -= numericAmount;
        } else {
            res.status(400).json({ message: "Invalid transaction type" });
            return;
        }

        customer.transactions.push({
            type,
            amount: numericAmount,
            note: note || "",
            createdAt: new Date(),
        });

        await customer.save();
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error: error instanceof Error ? error.message : error });
    }
};

// Delete customer
export const deleteCustomerHandler = async (req: Request, res: Response) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting customer", error: error instanceof Error ? error.message : error });
    }
};
