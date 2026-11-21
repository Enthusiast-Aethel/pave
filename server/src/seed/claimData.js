import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import BudgetPlan from "../models/BudgetPlan.js";
import Bill from "../models/Bill.js";
import Goal from "../models/Goal.js";
import Account from "../models/Account.js";
import Settings from "../models/Settings.js";

const email = (process.argv[2] || "").toLowerCase().trim();
if (!email) {
  console.error("Usage: node src/seed/claimData.js your@email.com");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOne({ email });
if (!user) {
  console.error("No user with that email. Register in the app first.");
  process.exit(1);
}

for (const Model of [Transaction, BudgetPlan, Bill, Goal, Account]) {
  const r = await Model.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
  console.log(`${Model.modelName}: ${r.modifiedCount} claimed`);
}

// Old single settings document -> yours (replaces the fresh default one)
const orphan = await Settings.findOne({ user: { $exists: false } });
if (orphan) {
  await Settings.deleteMany({ user: user._id });
  await Settings.updateOne({ _id: orphan._id }, { $set: { user: user._id, userName: user.name } });
  console.log("Settings: claimed");
}

await mongoose.disconnect();
console.log("Done.");