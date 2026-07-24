import { Router } from "express";
import { createBanner, deleteBanner, getBanners, updateBanner } from "../controller/banner.controller";
import { auth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getBanners);
router.post("/", auth('admin'), createBanner);
router.put("/:id", auth('admin'), updateBanner);
router.delete("/:id", auth('admin'), deleteBanner);

export default router;
