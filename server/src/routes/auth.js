import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { getSettings } from "../models/Settings.js";
import { sendPasswordResetEmail } from "../utils/email.js";

const router = Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Enter your name" });
    if (!EMAIL.test(email || "")) return res.status(400).json({ message: "Enter a valid email" });
    if (!password || password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    await getSettings(user._id, { userName: user.name });

    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That email is already registered" });
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase().trim() }).select("+passwordHash");
    const ok = user && (await bcrypt.compare(password || "", user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Incorrect email or password" });

    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: "Account not found" });
  res.json(publicUser(user));
});

// POST /api/auth/change-password (requires authentication)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const user = await User.findById(req.userId).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Account not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password (public)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!EMAIL.test(email || "")) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const user = await User.findOne({ email: (email || "").toLowerCase().trim() });

    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || "https://pave-omega.vercel.app").split(",")[0].trim();
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Could not process request. Please try again." });
  }
});

// POST /api/auth/reset-password (public)
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ message: "Token, email, and new password are required" });
    }
    if (!EMAIL.test(email || "")) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email: (email || "").toLowerCase().trim() }).select("+passwordHash +resetPasswordToken +resetPasswordExpires");
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    if (user.resetPasswordToken !== hashedToken || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now sign in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;