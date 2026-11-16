import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { getSettings } from "../models/Settings.js";

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

export default router;