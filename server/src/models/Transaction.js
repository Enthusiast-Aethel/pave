import mongoose from "mongoose";

const LATE_INCOME_DAY = 20; // moves to user settings in Step 8

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

// Late-income shift: income on/after day 20 counts for next month
transactionSchema.pre("validate", function (next) {
  const d = new Date(this.date);
  if (this.type === "Income" && d.getDate() >= LATE_INCOME_DAY) {
    this.effectiveDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  } else {
    this.effectiveDate = d;
  }
  next();
});

export default mongoose.model("Transaction", transactionSchema);