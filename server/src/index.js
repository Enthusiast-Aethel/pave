import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budget.js";
import billRoutes from "./routes/bills.js";
import goalRoutes from "./routes/goals.js";
import settingsRoutes from "./routes/settings.js";
import networthRoutes from "./routes/networth.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Pave" });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/networth", networthRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Pave API running on port ${PORT}`));
});