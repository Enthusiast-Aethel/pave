import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    linkedCategory: { type: String, required: true }, // linked Savings category
    target: { type: Number, required: true, min: 0 },
    openingBalance: { type: Number, default: 0, min: 0 },
    plannedPerMonth: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);