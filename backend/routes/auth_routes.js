import express from "express";
import dotenv from 'dotenv';
import { forgotPassword, login, logout, signup ,verifyEmail,resetPassword,checkauth} from "../controllers/auth_controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router=express.Router();
router.get("/check-auth",verifyToken,checkauth);
router.post("/signup",signup);
router.post("/verify-email",verifyEmail); 
router.post("/login",login)
router.post("/logout",logout)
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);

export default router;