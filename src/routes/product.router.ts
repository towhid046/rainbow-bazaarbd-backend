import express from "express";

import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controller/product.controller";

import verifyAdmin from "../middleware/verifyAdmin";

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
  // verifyAdmin,
  createProductHandler
);

productRouter.put(
  "/:id",
  // verifyAdmin,
  updateProductHandler
);

productRouter.delete(
  "/:id",
  // verifyAdmin,
  deleteProductHandler
);

export default productRouter;