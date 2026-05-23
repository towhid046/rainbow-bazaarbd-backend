// src/routes/order.router.ts
import express from "express";
import { getAllOrdersHandler, getOrderHandler, updateOrderStatusHandler, deleteOrderHandler, getOrderSummaryHandler } from "../controller/order.controller";
import { createOrderHandler } from "../controller/order.controller";
import verifyAdmin from "../middleware/verifyAdmin";

const orderRouter = express.Router();
orderRouter.get(
    "/summary",
    // verifyAdmin,
    getOrderSummaryHandler
  );

orderRouter.get("/", 
    // verifyAdmin, 
    getAllOrdersHandler
);
orderRouter.get("/:id", 
    // verifyAdmin,
    getOrderHandler);
orderRouter.put("/:id", 
    // verifyAdmin, 
    updateOrderStatusHandler
);
orderRouter.delete("/:id",
    //  verifyAdmin,
     
     deleteOrderHandler);

// Public: anyone can create an order
orderRouter.post("/", createOrderHandler); 


export default orderRouter;