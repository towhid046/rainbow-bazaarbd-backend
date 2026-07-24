import { Router } from "express";
import { getMe, googleLogin, login, logout, register, updateProfile } from "../controller/auth.controller";
import { auth } from "../middleware/auth.middleware";
import hashPassword from "../middleware/hashPassword";

const router = Router();

router.post("/signup", hashPassword, register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);

router.get("/me", auth('user','admin'), getMe);
router.put("/update-profile", auth('user','admin'), updateProfile);

export default router;