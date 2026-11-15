import "dotenv/config";
import mongoose from "mongoose";
import Account from "../models/Account.js";

const A = "Asset";
const L = "Liability";

// [kind, name, category, Sep 2026, Oct 2026]
const sample = [
  [A, "Main Bank Account", "Cash & M-Pesa", 108000, 121000],
  [A, "M-Pesa & Mobile Wallet", "Cash & M-Pesa", 16000, 13000],
  [A, "SACCO Shares & Deposits", "SACCO Shares & Deposits", 322000, 331000],
  [A, "Money Market Fund", "Investments (MMF / Stocks)", 238500, 246500],
  [A, "NSSF / Pension", "Retirement & Pension", 121600, 124800],
  [A, "Plot of Land", "Real Estate & Land", 1250000, 1250000],
  [A, "Vehicle", "Vehicles", 610000, 605000],
  [A, "Business Equipment", "Business Equity", 300000, 300000],
  [L, "SACCO Development Loan", "SACCO Loan", 180000, 165000],
  [L, "Vehicle Loan", "Bank Loan", 320000, 310000],
  [L, "Credit Card", "Credit Card / Overdraft", 17000, 14000],
];

await mongoose.connect(process.env.MONGO_URI);

if (await Account.countDocuments()) {
  console.log("Accounts already exist. Nothing seeded.");
} else {
  await Account.insertMany(
    sample.map(([kind, name, category, sep, oct]) => ({
      kind, name, category, balances: { "2026-09": sep, "2026-10": oct },
    }))
  );
  console.log("Sample accounts added.");
}

await mongoose.disconnect();