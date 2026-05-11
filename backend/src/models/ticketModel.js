import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Open", "Resolved", "Rejected"],
      default: "Open"
    },
    // Captured statically at time of creation
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    zoneCountry: {
      type: String,
      required: true
    },
    zoneDistrict: {
      type: String,
      required: true
    },
    zonePostalCode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
