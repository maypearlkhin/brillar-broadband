import mongoose from "mongoose";
import { seedDatabase } from "./seed.js";

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Please define MONGODB_URI in your environment.");
  }

  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(mongoUri, {
    bufferCommands: false
  });

  await seedDatabase();

  return mongoose.connection;
}
