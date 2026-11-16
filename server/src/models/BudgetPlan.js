import mongoose from "mongoose";

const budgetPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    type: { type: String, enum: ["Income", "Expenses", "Savings"], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

budgetPlanSchema.index({ user: 1, year: 1, month: 1, type: 1, category: 1 }, { unique: true });

export default mongoose.model("BudgetPlan", budgetPlanSchema);