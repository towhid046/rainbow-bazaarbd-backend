import express from "express";
import { createSheetOrder, getSheetOrderHandler, getSheetOrderById, deleteSheetOrder } from "../controller/photocopyOrder.controller";
import { upload } from "../utils/multerUpload";
import verifyAdmin from "../middleware/verifyAdmin";

const photocopyOrderRouter = express.Router();
  
photocopyOrderRouter.get('/', verifyAdmin, getSheetOrderHandler)
photocopyOrderRouter.get('/:id', verifyAdmin,  getSheetOrderById)
photocopyOrderRouter.post("/", upload.array('pdfFiles', 5), createSheetOrder);
photocopyOrderRouter.delete("/:id", verifyAdmin, deleteSheetOrder);

export default photocopyOrderRouter;
