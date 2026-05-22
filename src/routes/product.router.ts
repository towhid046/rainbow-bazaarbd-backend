import express from "express";

import {
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getCartSummaryHandler,
  getProductCountHandler,
  getSingleProductHandler,
  updateProductHandler,
} from "../controller/product.controller";

import verifyAdmin from "../middleware/verifyAdmin";

const productRouter = express.Router();



/**
 * PUBLIC ROUTES
 */
productRouter.post(
  "/cart-summary",
  getCartSummaryHandler
);

productRouter.get(
  "/count",
  getProductCountHandler
);

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
  verifyAdmin,
  updateProductHandler
);

productRouter.delete(
  "/:id",
  verifyAdmin,
  deleteProductHandler
);

export default productRouter;