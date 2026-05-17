import express from "express";
import { createService, deleteService, getAllServices, updateService } from "../controller/service.controller";

const serviceRouter = express.Router();

serviceRouter.get("/", getAllServices);
serviceRouter.post("/", createService);
serviceRouter.put("/:id", updateService);
serviceRouter.delete("/:id", deleteService);

export default serviceRouter;
