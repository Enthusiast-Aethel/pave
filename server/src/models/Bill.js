import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    dueDay: { type: Number, required: true, min: 1, max: 31 },
    firstMonth: { type: Number, min: 1, max: 12, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Bill", billSchema);