import { Test } from "./config.ts";

try {
  await Test.deleteMany();
  const test1 = new Test({ hello: "world" });
  await test1.save();
} catch (e) {
  console.error("❌ Mongoose error pooling:", e);
  process.exit(1);
}
