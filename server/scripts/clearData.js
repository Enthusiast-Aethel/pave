import "dotenv/config";
import mongoose from "mongoose";

// Import all models to ensure they're registered
import "../src/models/User.js";
import "../src/models/Transaction.js";
import "../src/models/BudgetPlan.js";
import "../src/models/Bill.js";
import "../src/models/Goal.js";
import "../src/models/Settings.js";
import "../src/models/Category.js";
import "../src/models/Account.js";
import "../src/models/Investment.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is required in environment variables");
  process.exit(1);
}

async function clearAllData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    const models = [
      { name: "User", model: mongoose.model("User") },
      { name: "Transaction", model: mongoose.model("Transaction") },
      { name: "BudgetPlan", model: mongoose.model("BudgetPlan") },
      { name: "Bill", model: mongoose.model("Bill") },
      { name: "Goal", model: mongoose.model("Goal") },
      { name: "Settings", model: mongoose.model("Settings") },
      { name: "Category", model: mongoose.model("Category") },
      { name: "Account", model: mongoose.model("Account") },
      { name: "Investment", model: mongoose.model("Investment") },
    ];

    console.log("\nClearing all database collections...");
    for (const { name, model } of models) {
      const result = await model.deleteMany({});
      console.log(`  Cleared ${result.deletedCount} documents from ${name}`);
    }

    console.log("\nAll test data cleared successfully! Database is clean for real users.\n");
  } catch (err) {
    console.error("Error clearing database data:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

clearAllData();