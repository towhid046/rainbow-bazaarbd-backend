import { Request, Response } from "express";
import { z } from "zod";
import { Book } from "../models/Book.model";
import { BookOrder } from "../models/BookOrder.model";
import { User } from "../models/User.model";
import { zodBookOrderSchema } from "../schemas/BookOrder.schema";

interface QueryProp {
    limit?: number;
    skip?: number;
}
// ✅ Define the TypeScript type for book order request
type BookOrderRequest = z.infer<typeof zodBookOrderSchema>;

export const postBookOrderController = async (req: Request, res: Response) => {
    console.log(req.body)
    try {
        // ✅ Validate request data with Zod
        const validatedData: BookOrderRequest = zodBookOrderSchema.parse(req.body);

        // ✅ Extract book IDs and counts from the request
        const ids = validatedData.bookIds.map((book) => book.id).reduce((acc: string[], id: string) => {
            if (!acc.includes(id)) {
                acc.push(id);
            }
            return acc;
        }, []);

        // ✅ Fetch book details from the database
        const books = await Book.find({ _id: { $in: ids } });

        // ✅ Check if all books exist
        if (books.length !== ids.length) {
            res.status(404).json({ message: "One or more books not found" });
            return;
        }

        // ✅ Calculate the total price and update book leftCount
        let totalPrice = 0;
        for (const orderBook of validatedData.bookIds) {
            const book = books.find((b) => b._id.toString() === orderBook.id);
            if (book) {
                const edition = book.editions.find(e => e.condition === orderBook.condition);
                if (!edition) {
                    throw new Error(`Book "${book.title}" does not have ${orderBook.condition} edition`);
                }
                if (edition.stockCount < orderBook.count) {
                    throw new Error(`Not enough stock for ${book.title} (${orderBook.condition} edition)`);
                }
                totalPrice += edition.price * orderBook.count;
                edition.stockCount -= orderBook.count;
                await book.save();
            }
        }

        // ✅ Create a new book order
        const newOrder = new BookOrder({
            ...validatedData,
            totalPrice: Math.floor(totalPrice), // Add total price to the order
        });

        // ✅ Save the order in the database
        await newOrder.save();

        if (validatedData.email) {
            // ✅ Update the user's order history
            const user = await User.findOne({ email: validatedData.email });
            if (user) {
                user.orderIds.push(newOrder._id);
                await user.save();
            }
        }

        // After creating a new book order, we need to update its status to 'Processing'.
        // This is done using the findByIdAndUpdate method, which locates the order by its ID.
        // The method then updates the status field to 'Processing'.
        // The options { new: true, runValidators: true } ensure that the updated document is returned
        // and that the update operation adheres to the schema's validation rules.
        // This code does not update the stockCount. It updates the status of the newly created order to 'Processing'.
        // The stockCount is updated earlier in the code within the loop that processes each book in the order.
        // Specifically, the line `edition.stockCount -= orderBook.count;` reduces the stockCount for each book edition.
        await BookOrder.findByIdAndUpdate(newOrder._id, {status: 'Processing'}, {
            new: true,
            runValidators: true,
        });

        // ✅ Send a success response
        res.status(200).json({ message: "Order placed successfully", order: newOrder });
    } catch (error) {
        // Handle validation and server errors
        console.error("Error placing order:", error);
        res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
};

export const getAllBookOrderController = async (req: Request, res: Response) => {
    const query: QueryProp = {}; // Use Partial to make properties optional
    try {
        // Parse limit and skip from query params
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

        // Fetch orders with pagination, sorting, and population
        const orders = await BookOrder.find({status:{$in:['Pending','Processing']}})
            .select('-__v -bookIds._id') // Exclude unnecessary fields
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .limit(query.limit || 0) // Default to 10 items per page
            .skip(query.skip || 0) // Default to no skipping
            .populate({
                path: 'bookIds.id',
                select: '-__v',
            });

        res.status(200).send(orders);
    } catch (error) {
        console.error("Error fetching orders:", error); // Log the error for debugging
        res.status(400).send({ message: "Failed to fetch orders", error });
    }
};

export const getBookOrderByIdController = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;
        
        if (!orderId) {
            res.status(400).send({ message: "Order ID is required" });
            return;
        }

        const order = await BookOrder.findById(orderId)
            .select('-__v -bookIds._id') // Exclude unnecessary fields
            .populate({
                path: 'bookIds.id',
                select: '-__v',
            });

        if (!order) {
            res.status(404).send({ message: "Order not found" });
            return;
        }

        res.status(200).send(order);
    } catch (error) {
        console.error("Error fetching order by ID:", error); // Log the error for debugging
        res.status(400).send({ message: "Failed to fetch order", error });
    }
};

export const putBookOrderByIdController = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            res.status(400).send({ message: "Order ID is required" });
            return;
        }

        const order = await BookOrder.findById(orderId);
        if (!order) {
            res.status(404).send({ message: "Order not found" });
            return;
        }

        const updatedOrder = await BookOrder.findByIdAndUpdate(orderId, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).send(updatedOrder);
    } catch (error) {
        console.error("Error updating order by ID:", error); // Log the error for debugging
        res.status(400).send({ message: "Failed to update order", error });
    }
}

export const deleteBookOrderByIdController = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;
        if (!orderId) {
            res.status(400).send({ message: "Order ID is required" });
            return;
        }

        const order = await BookOrder.findById(orderId);
        if (!order) {
            res.status(404).send({ message: "Order not found" });
            return;
        }

        await BookOrder.findByIdAndDelete(orderId);

        res.status(200).send({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order by ID:", error); // Log the error for debugging
        res.status(400).send({ message: "Failed to delete order", error });
    }
};

export const estimateBookOrderCount = async (req: Request, res: Response) => {
    try {
        const count = await BookOrder.countDocuments({status:{$in:['Pending', 'Processing']}});
         res.status(200).json({count});
      } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Internal server error." });
      }
}