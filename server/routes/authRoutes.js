import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendNewUserOtp, sendResetOtp, sendVerifyOtp, verifyEmail, verifyNewUserOtp, verifyOtp } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

authRouter.post("/otp-verification", verifyOtp);
authRouter.post("/send-new-user-otp", sendNewUserOtp);

authRouter.post("/new-user-otp-verification", verifyNewUserOtp);
// authRouter.post("/just-hash", justHash);

export default authRouter;
