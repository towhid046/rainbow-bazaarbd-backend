import express from "express";
import verifyAdmin from "../middleware/verifyAdmin";
import {
    createPreOrderHandler,
    getAllPreOrderHandler,
    getPreOrderCountHandler,
    getSinglePreOrderHandler,
    updatePreOrderHandler,
    deletePreOrderHandler
} from "../controller/preOrder.controller";

const preOrderRouter = express.Router();

preOrderRouter.get("/get-count", verifyAdmin, getPreOrderCountHandler);
preOrderRouter.get("/", verifyAdmin, getAllPreOrderHandler);
preOrderRouter.get("/:id", verifyAdmin, getSinglePreOrderHandler);
preOrderRouter.post("/", verifyAdmin, createPreOrderHandler);
preOrderRouter.patch("/:id", verifyAdmin, updatePreOrderHandler);
preOrderRouter.delete("/:id", verifyAdmin, deletePreOrderHandler);

export default preOrderRouter;
