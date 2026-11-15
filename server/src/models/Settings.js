import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userName: { type: String, default: "Charles" },
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

// One settings document for now (becomes per-user in Step 9)
export async function getSettings() {
  return (await Settings.findOne()) || (await Settings.create({}));
}

export default Settings;