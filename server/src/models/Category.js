import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Income", "Expenses", "Savings"], required: true },
    icon: { type: String, default: "Shapes" },
    hidden: { type: Boolean, default: false },
    renamed: { type: Boolean, default: false }, // true if this renames a built-in category
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, label: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);