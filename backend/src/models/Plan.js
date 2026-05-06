import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0
    },
    downloadSpeedMbps: {
      type: Number,
      required: true,
      min: 1
    },
    features: {
      type: [String],
      default: []
    },
    categoryId: {
      type: String,
      default: "general",
      trim: true
    },
    categoryTitle: {
      type: String,
      default: "Plans",
      trim: true
    },
    categorySortOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);
