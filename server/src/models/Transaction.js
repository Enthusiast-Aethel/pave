import mongoose from "mongoose";
import { getSettings } from "./Settings.js";

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    currency: { type: String, default: "KES" },
    type: { type: String, enum: ["Income", "Expenses", "Savings"], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    effectiveDate: { type: Date },
  },
  { timestamps: true }
);

// Late-income shift: uses the day set in Settings
transactionSchema.pre("validate", async function () {
  const s = await getSettings();
  const d = new Date(this.date);
  if (this.type === "Income" && s.lateIncomeActive && d.getDate() >= s.lateIncomeDay) {
    this.effectiveDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  } else {
    this.effectiveDate = d;
  }
});

export default mongoose.model("Transaction", transactionSchema);