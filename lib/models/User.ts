import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const serviceZoneSchema = new Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },
    serviceZone: {
      type: serviceZoneSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);

export default User;
