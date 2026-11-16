import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import auth from "./middleware/auth.js";
import BudgetPlan from "./models/BudgetPlan.js";
import Settings from "./models/Settings.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budget.js";
import billRoutes from "./routes/bills.js";
import goalRoutes from "./routes/goals.js";
import settingsRoutes from "./routes/settings.js";
import networthRoutes from "./routes/networth.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in server/.env");
  process.exit(1);
}

const app = express();

// Render sits behind a proxy; needed for correct client IPs in rate limiting[cite: 15]
app.set("trust proxy", 1);[cite: 15]

const allowedOrigins = [[cite: 15]
  ...(process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean),[cite: 15]
  "https://localhost",        // the Android app (Capacitor)[cite: 15]
  "capacitor://localhost",    // reserved for a future iOS app[cite: 15]
  "http://localhost:5173",    // local development[cite: 15]
];[cite: 15]

app.use([cite: 15]
  cors({[cite: 15]
    origin(origin, cb) {[cite: 15]
      // No origin = tools like Thunder Client or server-to-server calls[cite: 15]
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);[cite: 15]
      cb(new Error("Not allowed by CORS"));[cite: 15]
    },[cite: 15]
  })[cite: 15]
);[cite: 15]

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "Pave" }));

// Public: register / login (rate limited against password guessing)
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 }), authRoutes);

// Everything below requires a valid token
app.use("/api/transactions", auth, transactionRoutes);
app.use("/api/budget", auth, budgetRoutes);
app.use("/api/bills", auth, billRoutes);
app.use("/api/goals", auth, goalRoutes);
app.use("/api/settings", auth, settingsRoutes);
app.use("/api/networth", auth, networthRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Replaces the old unique indexes with the per-user ones
  await BudgetPlan.syncIndexes();
  await Settings.syncIndexes();
  app.listen(PORT, () => console.log(`Pave API running on port ${PORT}`));
});