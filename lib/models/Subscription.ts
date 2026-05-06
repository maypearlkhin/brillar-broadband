import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending Admin Approval", "Installation Approved", "Rejected"],
    default: "Pending Admin Approval"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

const Subscription =
  (mongoose.models.Subscription as Model<SubscriptionDocument>) ||
  mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

export default Subscription;
