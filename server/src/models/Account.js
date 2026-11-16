import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["Asset", "Liability"], required: true },
    category: { type: String, required: true },
    balances: { type: Object, default: {} },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("Account", accountSchema);