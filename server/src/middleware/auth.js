import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not signed in" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = new mongoose.Types.ObjectId(payload.id); // ObjectId so aggregates match too
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}