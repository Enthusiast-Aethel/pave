import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["Asset", "Liability"], required: true },
    category: { type: String, required: true },
    balances: { type: Object, default: {} }, // { "2026-10": 121000, ... }
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("Account", accountSchema);