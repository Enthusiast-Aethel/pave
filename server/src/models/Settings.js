import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    userName: { type: String, default: "" },
    currency: { type: String, default: "KES" },
    startingYear: { type: Number, default: 2025 },
    lateIncomeActive: { type: Boolean, default: true },
    lateIncomeDay: { type: Number, default: 20, min: 1, max: 31 },
    ruleMandatory: { type: Number, default: 50 },
    ruleSavings: { type: Number, default: 30 },
    ruleWants: { type: Number, default: 20 },
    netWorthGoal: { type: Number, default: 4000000 },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

// Each user has exactly one settings document, created on first use
export async function getSettings(userId, defaults = {}) {
  return Settings.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, ...defaults } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export default Settings;