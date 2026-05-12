import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "SGD",
    trim: true,
    uppercase: true
  },
  /** Contract length in whole days (30 / 90 / 180 / 365). */
  billingTermDays: {
    type: Number,
    required: true,
    enum: [30, 90, 180, 365]
  },
  paidAt: {
    type: Date,
    required: true,
    index: true
  },
  /** Snapshot at checkout for stable invoices/PDFs if plans change later. */
  planName: {
    type: String,
    required: true,
    trim: true
  },
  planDownloadSpeedMbps: {
    type: Number,
    required: true,
    min: 1
  },
  customerName: {
    type: String,
    default: "",
    trim: true
  },
  customerEmail: {
    type: String,
    default: "",
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
