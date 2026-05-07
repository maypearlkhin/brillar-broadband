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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
