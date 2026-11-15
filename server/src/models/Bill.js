import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true }, // linked Expenses category
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    dueDay: { type: Number, required: true, min: 1, max: 31 },
    firstMonth: { type: Number, min: 1, max: 12, default: 1 }, // for Quarterly / Yearly
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);