import mongoose from "mongoose";

const budgetPlanSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    type: { type: String, enum: ["Income", "Expenses", "Savings"], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One planned amount per category per month
budgetPlanSchema.index({ year: 1, month: 1, type: 1, category: 1 }, { unique: true });

export default mongoose.model("BudgetPlan", budgetPlanSchema);