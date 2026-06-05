// src/routes/order.router.ts
import express from "express";
import { createOrderHandler, deleteOrderHandler, getAllOrdersHandler, getOrderHandler, getOrderSummaryHandler, updateOrderStatusHandler } from "../controller/order.controller";
import { auth } from "../middleware/auth.middleware";

const orderRouter = express.Router();
orderRouter.get(
    "/summary",
    auth("admin"),
    getOrderSummaryHandler
  );

orderRouter.get("/", 
    auth("admin"), 
    getAllOrdersHandler
);

orderRouter.get("/:id", 
    auth("admin"),
    getOrderHandler);

orderRouter.put("/:id", 
    auth("admin"), 
    updateOrderStatusHandler
);

orderRouter.delete("/:id",
    auth("admin"),
    deleteOrderHandler);

// Public: anyone can create an order
orderRouter.post("/", createOrderHandler); 


export default orderRouter;