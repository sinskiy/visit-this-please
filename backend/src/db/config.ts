import { Schema, connect, model } from "mongoose";
import env from "../lib/env.ts";

const testSchema = new Schema({
  hello: String,
});
export const Test = model("Test", testSchema);

const userSchema = new Schema({
  username: String,
  password: String,
});
export const User = model("User", userSchema);

const placeSchema = new Schema({
  primaryText: String,
  secondaryText: String,
});
export const Place = model("Place", placeSchema);

try {
  await connect(env.DB_URL);
} catch (e) {
  console.error("❌ Mongoose error connecting:", e);
  process.exit(1);
}
