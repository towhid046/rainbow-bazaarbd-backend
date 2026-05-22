import express from "express";
import verifyAdmin from "../middleware/verifyAdmin";
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from "../controller/category.controller";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategoriesHandler); // Public

// TODO: temporarily we do comment the admin verification but we will uncomment once user module finished

// categoryRouter.post("/", verifyAdmin, createCategoryHandler); // Admin only
// categoryRouter.put("/:id", verifyAdmin, updateCategoryHandler); // Admin only
// categoryRouter.delete("/:id", verifyAdmin, deleteCategoryHandler); // Admin only

categoryRouter.post("/", createCategoryHandler); 
categoryRouter.put("/:id", updateCategoryHandler);
categoryRouter.delete("/:id", deleteCategoryHandler);

export default categoryRouter;