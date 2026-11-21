import { Router } from "express";
import Category from "../models/Category.js";
import { CATEGORIES, DEFAULT_STYLES } from "../utils/defaultCategories.js";

const router = Router();

// GET /api/categories - returns user's custom categories merged with defaults
router.get("/", async (req, res) => {
  try {
    const custom = await Category.find({ user: req.userId }).lean();
    const hidden = new Set(custom.filter((c) => c.hidden).map((c) => c.name));
    const renamed = new Map(custom.filter((c) => c.hidden === false && c.renamed).map((c) => [c.name, c]));

    // Build merged lists
    const result = { Income: [], Expenses: [], Savings: [] };
    for (const type of Object.keys(CATEGORIES)) {
      for (const name of CATEGORIES[type]) {
        const c = renamed.get(name);
        result[type].push({
          name: c ? c.label : name,
          original: name,
          hidden: hidden.has(name),
          icon: c ? c.icon : (DEFAULT_STYLES[name] ? DEFAULT_STYLES[name][0] : "Shapes"),
          isCustom: false,
        });
      }
    }
    // Add fully custom categories
    for (const c of custom.filter((c) => !c.hidden && !c.renamed)) {
      if (!result[c.type].some((x) => x.name === c.label)) {
        result[c.type].push({
          name: c.label,
          original: c.label,
          hidden: false,
          icon: c.icon || "Shapes",
          isCustom: true,
          _id: c._id,
        });
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories - add a custom category
router.post("/", async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    if (!name || !type) return res.status(400).json({ message: "Name and type required" });
    if (!["Income", "Expenses", "Savings"].includes(type)) return res.status(400).json({ message: "Invalid type" });
    const exists = await Category.findOne({ user: req.userId, label: name });
    if (exists) return res.status(400).json({ message: "Category already exists" });
    const cat = await Category.create({ user: req.userId, label: name, type, icon: icon || "Shapes" });
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/categories/:id - rename or hide
router.put("/:id", async (req, res) => {
  try {
    const { label, hidden, icon } = req.body;
    const cat = await Category.findOne({ _id: req.params.id, user: req.userId });
    if (!cat) return res.status(404).json({ message: "Not found" });
    if (label !== undefined) cat.label = label;
    if (hidden !== undefined) cat.hidden = hidden;
    if (icon !== undefined) cat.icon = icon;
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  try {
    await Category.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;