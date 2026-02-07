import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// eslint-disable-next-line no-var
declare var global: typeof globalThis & { mongooseCache?: Cache };

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

export async function connectDB() {
  if (global.mongooseCache?.conn) return global.mongooseCache.conn;

  if (!global.mongooseCache?.promise) {
    global.mongooseCache = global.mongooseCache || { conn: null, promise: null };
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI);
  }

  global.mongooseCache.conn = await global.mongooseCache.promise!;
  return global.mongooseCache.conn;
}
