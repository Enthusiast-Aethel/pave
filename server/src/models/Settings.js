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
    billReminders: { type: Boolean, default: true },
    reminderDaysBefore: { type: Number, default: 2, min: 0, max: 14 },
    reminderTime: { type: String, default: "08:00" },
    // App lock
    appLockEnabled: { type: Boolean, default: false },
    appLockPIN: { type: String, default: "" },
    appLockMethod: { type: String, enum: ["PIN", "Biometric", "Both"], default: "PIN" },
    autoLockMinutes: { type: Number, default: 1, min: 0, max: 60 },
    // Hide amounts
    hideAmounts: { type: Boolean, default: false },
    // Emergency fund (for health score)
    emergencyFundMonths: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);

// Each user has exactly one settings document, created on first use
export async function getSettings(userId, defaults = {}) {
  const existing = await Settings.findOne({ user: userId });
  if (existing) return existing;
  try {
    return await Settings.create({ user: userId, ...defaults });
  } catch (err) {
    if (err.code === 11000) return Settings.findOne({ user: userId }); // created by a parallel request
    throw err;
  }
}

export default Settings;