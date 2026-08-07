import { Router } from "express";
import { loginWithEmail, logout, googleLoginCallback, loginWithGoogle, regenAccessToken, resendVerificationEmail, forgotPassword, resetPassword } from "../feature/auth/controllers/login.controller.js";
import { registerWithEmail, googleCallback, registerWithGoogle, verifyEmail } from "../feature/auth/controllers/register.controller.js";

const router = Router();

// Register routes
router.post("/register", registerWithEmail);
router.get("/register/google", registerWithGoogle);
router.get("/register/google/callback", googleCallback);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);

// Login routes
router.post("/login", loginWithEmail);
router.get("/google", loginWithGoogle);
router.get("/google/callback", googleLoginCallback);
router.get("/logout", logout);
router.post("/regen-access-token", regenAccessToken);

// Forgot password routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;