import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    script: {
      type: String,
      required: true,
      trim: true
    },
    token: {
      type: String,
      default: "",
      trim: true
    },
    endpointDomain: {
      type: String,
      default: "https://backend.atenxion.ai/api",
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Integration || mongoose.model("Integration", integrationSchema);
