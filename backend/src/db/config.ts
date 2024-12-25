import { Schema, connect, model } from "mongoose";
import env from "../env.ts";

const testSchema = new Schema({
  hello: String,
});

export const Test = model("Test", testSchema);

try {
  await connect(env.DB_URL);
} catch (e) {
  console.error("❌ Mongoose error connecting:", e);
  process.exit(1);
}
