import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

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
const BACKUP_DIR = process.env.BACKUP_DIR || "./backups";

if (!MONGO_URI) {
  console.error("MONGO_URI is required in environment variables");
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

async function backupCollection(model, collectionName) {
  const documents = await model.find({}).lean();
  console.log(`  ${collectionName}: ${documents.length} documents`);
  return documents;
}

async function createBackup() {
  await connectDB();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `pave-backup-${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, `${backupName}.json`);
  const compressedPath = path.join(BACKUP_DIR, `${backupName}.json.gz`);

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`Creating backup: ${backupName}`);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    collections: {}
  };

  // Backup all collections
  const models = [
    { model: mongoose.model("User"), name: "users" },
    { model: mongoose.model("Transaction"), name: "transactions" },
    { model: mongoose.model("BudgetPlan"), name: "budgetPlans" },
    { model: mongoose.model("Bill"), name: "bills" },
    { model: mongoose.model("Goal"), name: "goals" },
    { model: mongoose.model("Settings"), name: "settings" },
    { model: mongoose.model("Category"), name: "categories" },
    { model: mongoose.model("Account"), name: "accounts" },
    { model: mongoose.model("Investment"), name: "investments" },
  ];

  for (const { model, name } of models) {
    backup.collections[name] = await backupCollection(model, name);
  }

  // Write JSON backup
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`  Written: ${backupPath}`);

  // Create compressed backup
  const jsonContent = fs.readFileSync(backupPath);
  const compressed = await gzipAsync(jsonContent);
  fs.writeFileSync(compressedPath, compressed);
  console.log(`  Compressed: ${compressedPath} (${(compressed.length / 1024).toFixed(1)} KB)`);

  // Clean up uncompressed file to save space
  fs.unlinkSync(backupPath);

  console.log("\nBackup completed successfully!");
  console.log(`Location: ${compressedPath}`);

  await mongoose.disconnect();
  return compressedPath;
}

// Run backup
createBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});