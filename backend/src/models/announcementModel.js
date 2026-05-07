import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
