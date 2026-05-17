import express from "express";
import { checkAdmin, getUserHandler, loginUserHandler, logoutHandler, registerUserHandler } from "../controller/user.controller";
import hashPassword from "../middleware/hashPassword";
import verifyAdmin from "../middleware/verifyAdmin";

const userRouter = express.Router();

userRouter.post("/", hashPassword, registerUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/", verifyAdmin, getUserHandler);
userRouter.get("/check-admin",verifyAdmin, checkAdmin);
userRouter.post("/logout", logoutHandler);


export default userRouter;
