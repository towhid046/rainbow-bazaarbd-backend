import { Request, Response } from "express";
import { Book } from "../models/Book.model";
import { bookZodSchema } from "../schemas/Book.schema";

interface CartItemDTO {
    id: string;
    count: number;
    condition: string;
  }

export const getAllBookHandler = async (req: Request, res: Response) => {
    const { limit, skip, search } = req.query;
    try {
        // Construct query object dynamically
        const query: any = {};
        if (search) {
            query.$or = [
                { title: new RegExp(search as string, 'i') },
                { author: new RegExp(search as string, 'i') },
                { location: new RegExp(search as string, 'i') }
            ];
        }

        const books = await Book.find(query).limit(Number(limit)).skip(Number(skip)).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching books", error: error instanceof Error ? error.message : error });
    }
}

export const getSingleBookHandler = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw new Error("ID is required to get a single book")
        }
        const book = await Book.findById(req.params.id)
        if (!book) {
            throw new Error("Book not found.")
        }
        res.status(200).json(book)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const createBookHandler = async (req: Request, res: Response) => {
    try {
        // validate book
        const validateBook = bookZodSchema.parse(req.body)
        const isBookNameExist = await Book.findOne({ title: new RegExp(req.body.title, 'i') })
        if (isBookNameExist) {
          throw new Error("Book Name is already exist!!")
        }
        const book = new Book(validateBook)
        const response = await book.save()
        res.status(200).json({ message: 'Book created successfully!', response })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const updateBookHandler = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw new Error("ID is required to update a book")
        }
        const validateBook = bookZodSchema.parse(req.body)
        const book = await Book.findByIdAndUpdate(req.params.id, validateBook, { new: true })
        if (!book) {
            throw new Error("Book not found.")
        }
        res.status(200).json({ message: 'Book updated successfully!', book })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const deleteBookHandler = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            throw new Error("ID is required to delete a book")
        }
        const book = await Book.findByIdAndDelete(req.params.id)
        if (!book) {
            throw new Error("Book not found.")
        }
        res.status(200).json({ message: 'Book deleted successfully!' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
}

export const getCartSummary = async (req: Request, res: Response) => {
    try {
      const items: CartItemDTO[] = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: "No cart items provided" });
        return;
      }
  
      // Extract unique book IDs without using Set iteration
      const allIds = items.map(i => i.id);
      const bookIds = allIds.filter((id, idx) => allIds.indexOf(id) === idx);
  
      const books = await Book.find({ _id: { $in: bookIds } });
      if (!books.length) {
        res.status(404).json({ message: "Books not found" });
        return;
      }
  
      // Build cart summary
      const summary = items
        .map(({ id, count, condition }) => {
          const book = books.find(b => b._id.equals(id));
          if (!book) return null;
          const ed = book.editions.find(e => e.condition === condition);
          if (!ed) return null;
          return {
            _id: book._id,
            title: book.title,
            image: book.image,
            condition,
            count,
            price: ed.price,
            stockCount: ed.stockCount,
            lineTotal: ed.price * count,
          };
        })
        .filter(x => x !== null);
  
      res.json(summary);
      return;
    } catch (error) {
      console.error("getCartSummary error:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
};

export const estimateBookCount = async (req: Request, res: Response) => {
  try {
    const count = await Book.estimatedDocumentCount();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error estimating book count:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
