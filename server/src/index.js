import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";
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
import categoryRoutes from "./routes/categories.js";
import investmentRoutes from "./routes/investments.js";
import exportRoutes from "./routes/export.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in server/.env");
  process.exit(1);
}

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

// Render sits behind a proxy; needed for correct client IPs in rate limiting
app.set("trust proxy", 1);

const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean),
  "https://localhost",        // the Android app (Capacitor)
  "capacitor://localhost",    // reserved for a future iOS app
  "http://localhost:5173",    // local development
];

app.use(
  cors({
    origin(origin, cb) {
      // No origin = tools like Thunder Client or server-to-server calls
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

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
app.use("/api/categories", auth, categoryRoutes);
  app.use("/api/investments", auth, investmentRoutes);
  app.use("/api/export", auth, exportRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Replaces the old unique indexes with the per-user ones
  await BudgetPlan.syncIndexes();
  await Settings.syncIndexes();
  app.listen(PORT, () => console.log(`Pave API running on port ${PORT}`));
});