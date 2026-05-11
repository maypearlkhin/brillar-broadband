import mongoose from "mongoose";

const embeddedZoneSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: "",
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["customer", "admin", "isp_team"],
      default: "customer"
    },
    serviceZone: {
      type: embeddedZoneSchema,
      required: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
