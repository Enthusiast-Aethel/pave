import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["MMF", "Stocks", "SACCO", "Bonds", "Other"], default: "MMF" },
    institution: { type: String, default: "" },
    units: { type: Number, default: 0 },
    currentPrice: { type: Number, default: 0 },
    initialValue: { type: Number, default: 0 },
    currentValue: { type: Number, required: true, default: 0 },
    history: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true },
      units: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);