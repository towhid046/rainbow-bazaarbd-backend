import express from "express";

import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controller/product.controller";
import { auth } from "../middleware/auth.middleware";


const productRouter = express.Router();



/**
 * PUBLIC ROUTES
 */


productRouter.get(
  "/",
  getAllProductsHandler
);

productRouter.get(
  "/:id",
  getSingleProductHandler
);



/**
 * ADMIN ROUTES
 */
productRouter.post(
  "/",
  auth("admin"), 
  createProductHandler
);

productRouter.put(
  "/:id",
  auth("admin"), 
  updateProductHandler
);

productRouter.delete(
  "/:id",
  auth("admin"), 
  deleteProductHandler
);

export default productRouter;