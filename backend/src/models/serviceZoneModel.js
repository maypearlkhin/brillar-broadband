import mongoose from "mongoose";

const serviceZoneSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, unique: true, trim: true }
  },
  { timestamps: false }
);

export default mongoose.models.ServiceZone || mongoose.model("ServiceZone", serviceZoneSchema);
