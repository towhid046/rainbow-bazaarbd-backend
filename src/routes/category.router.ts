import express from "express";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAllCategoriesHandler,
  updateCategoryHandler
} from "../controller/category.controller";
import { auth } from "../middleware/auth.middleware";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategoriesHandler); // Public


categoryRouter.post("/", 
  auth("admin"), 
  createCategoryHandler); // Admin only
categoryRouter.put("/:id",
  auth("admin"), 
  updateCategoryHandler); // Admin only
categoryRouter.delete("/:id",
  auth("admin"), 
  deleteCategoryHandler); // Admin only


export default categoryRouter;