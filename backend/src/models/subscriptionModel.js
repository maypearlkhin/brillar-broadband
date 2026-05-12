import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "Installed", "Active", "Blocked", "Cancelled", "Rejected"],
    default: "Pending"
  },
  planStatus: {
    type: String,
    enum: ["active", "blocked", "suspended", "pending", "cancelled"],
    default: "active"
  },
  billingTerm: {
    type: String,
    enum: ["30", "90", "180", "365"],
    default: "30"
  },
  amount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  routerId: {
    type: String,
    default: null,
    trim: true
  },
  installationAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    default: null
  },
  installedAt: {
    type: Date,
    default: null
  },
  activatedAt: {
    type: Date,
    default: null
  },
  blockedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
