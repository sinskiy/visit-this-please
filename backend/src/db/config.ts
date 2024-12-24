import { Schema, connect, model } from "mongoose";

const testSchema = new Schema({
  hello: String,
});

export const Test = model("Test", testSchema);

try {
  await connect("mongodb://localhost:27017/visit-this-please");
} catch (e) {
  console.error("❌ Mongoose error connecting:", e);
  process.exit(1);
}
