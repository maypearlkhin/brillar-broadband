import mongoose from "mongoose";
import { seedDatabase } from "@/lib/seed";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseConnection || {
  conn: null,
  promise: null
};

global.mongooseConnection = cached;

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Please define MONGODB_URI in your environment.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  await seedDatabase();

  return cached.conn;
}
