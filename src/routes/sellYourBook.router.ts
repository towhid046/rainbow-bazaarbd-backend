import express from "express";
import {
  getAllSellRequests,
  getSellRequestById,
  createOrUpdateSellRequest,
  updateSellRequest,
  deleteSellRequest,
} from "../controller/sellYourBook.controller";
import verifyAdmin from "../middleware/verifyAdmin";

const sellBookRouter = express.Router();

sellBookRouter.get("/", verifyAdmin, getAllSellRequests);
// New route: get single by id
sellBookRouter.get("/:id", verifyAdmin, getSellRequestById);
// Create or update by mobile
sellBookRouter.post("/", createOrUpdateSellRequest);
// Update by id
sellBookRouter.put("/:id", verifyAdmin, updateSellRequest);
// Delete by id
sellBookRouter.delete("/:id", verifyAdmin, deleteSellRequest);

export default sellBookRouter;