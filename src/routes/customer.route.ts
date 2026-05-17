import express from "express";
import { createCustomerHandler, deleteCustomerHandler, getAllCustomerHandler, getCustomerCountHandler, getSingleCustomerHandler, updateCustomerTransactionHandler, updateCustomerHandler  } from "../controller/customer.controller";
import verifyAdmin from "../middleware/verifyAdmin";

const customerRouter = express.Router();

customerRouter.get("/", verifyAdmin, getAllCustomerHandler);
customerRouter.get("/get-count", verifyAdmin, getCustomerCountHandler);
customerRouter.get("/:id", verifyAdmin, getSingleCustomerHandler);
customerRouter.post("/", verifyAdmin, createCustomerHandler);
customerRouter.patch("/:id", verifyAdmin, updateCustomerHandler);
customerRouter.patch("/trans/:id", verifyAdmin, updateCustomerTransactionHandler);
customerRouter.delete("/:id", verifyAdmin, deleteCustomerHandler);

export default customerRouter;
