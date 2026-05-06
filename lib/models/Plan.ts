import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const planSchema = new Schema(
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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export type PlanDocument = InferSchemaType<typeof planSchema>;

const Plan =
  (mongoose.models.Plan as Model<PlanDocument>) ||
  mongoose.model<PlanDocument>("Plan", planSchema);

export default Plan;
