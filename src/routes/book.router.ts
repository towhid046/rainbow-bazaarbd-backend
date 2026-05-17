import express from "express";
import { createBookHandler, deleteBookHandler, estimateBookCount, getAllBookHandler,getCartSummary , getSingleBookHandler, updateBookHandler } from "../controller/book.controller";
import verifyAdmin from "../middleware/verifyAdmin";

const bookRouter = express.Router();

// Move this route before the dynamic one
// bookRouter.get("/cart-items", getCartItems);
bookRouter.post("/cart-items", getCartSummary);
bookRouter.get("/get-count", estimateBookCount);

bookRouter.get("/", getAllBookHandler);
bookRouter.get("/:id", getSingleBookHandler);
bookRouter.post("/", verifyAdmin, createBookHandler);
bookRouter.put("/:id", verifyAdmin, updateBookHandler);
bookRouter.delete("/:id", verifyAdmin, deleteBookHandler);

export default bookRouter;
