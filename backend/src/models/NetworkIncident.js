import mongoose from "mongoose";

const networkIncidentSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    /** Set when ops clears an incident — kept for public history. */
    resolvedAt: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.models.NetworkIncident || mongoose.model("NetworkIncident", networkIncidentSchema);
