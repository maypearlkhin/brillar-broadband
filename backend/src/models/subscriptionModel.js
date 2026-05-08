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
    enum: ["Installation Pending", "Installation Approved", "Rejected"],
    default: "Installation Pending"
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
