import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { gunzip } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify(gunzip);

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

async function restoreCollection(model, collectionName, documents) {
  if (!documents || documents.length === 0) {
    console.log(`  ${collectionName}: 0 documents (skipped)`);
    return;
  }

  // Clear existing data for this collection (optional - comment out for append-only)
  await model.deleteMany({});
  console.log(`  Cleared existing ${collectionName}`);

  // Insert documents in batches
  const batchSize = 100;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    await model.insertMany(batch, { ordered: false });
  }
  console.log(`  Restored ${documents.length} documents to ${collectionName}`);
}

async function restoreBackup(backupFile) {
  await connectDB();

  const backupPath = path.isAbsolute(backupFile) 
    ? backupFile 
    : path.join(BACKUP_DIR, backupFile);

  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  console.log(`Restoring from: ${backupPath}`);

  let backupData;
  
  if (backupPath.endsWith(".gz")) {
    const compressed = fs.readFileSync(backupPath);
    const decompressed = await gunzipAsync(compressed);
    backupData = JSON.parse(decompressed.toString());
  } else {
    backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
  }

  console.log(`Backup version: ${backupData.version}`);
  console.log(`Exported at: ${backupData.exportedAt}`);

  const collections = backupData.collections || {};

  // Restore in order (users first since other collections reference them)
  const restoreOrder = [
    "users",
    "settings",
    "categories",
    "transactions",
    "budgetPlans",
    "bills",
    "goals",
    "accounts",
    "investments",
  ];

  for (const collectionName of restoreOrder) {
    const model = mongoose.model(collectionName.charAt(0).toUpperCase() + collectionName.slice(0, -1));
    // Handle pluralization exceptions
    const modelName = collectionName === "budgetPlans" ? "BudgetPlan" : 
                      collectionName.charAt(0).toUpperCase() + collectionName.slice(0, -1);
    
    const Model = mongoose.model(modelName);
    await restoreCollection(Model, collectionName, collections[collectionName]);
  }

  console.log("\nRestore completed successfully!");

  await mongoose.disconnect();
}

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error("Usage: node restore.js <backup-file>");
  console.error("Example: node restore.js pave-backup-2024-01-15T10-30-00.json.gz");
  console.error("\nAvailable backups:");
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(".json") || f.endsWith(".json.gz"))
      .sort()
      .reverse();
    files.forEach(f => console.error(`  ${f}`));
  }
  process.exit(1);
}

restoreBackup(backupFile).catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});