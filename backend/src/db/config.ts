import { Schema, connect, model } from "mongoose";
import env from "../lib/env.ts";

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});
export const User = model("User", userSchema);

const voteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["UP", "DOWN"],
    required: true,
  },
});

const placeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },

  country: { type: String, required: true },
  stateOrRegion: String,
  settlement: String,
  name: String,

  street: String,
  house: String,

  votes: [voteSchema],
});
export const Place = model("Place", placeSchema);

try {
  await connect(env.DB_URL);
} catch (e) {
  console.error("❌ Mongoose error connecting:", e);
  process.exit(1);
}
