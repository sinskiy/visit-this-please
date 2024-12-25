import { User } from "./config.ts";

try {
  await User.deleteMany();
} catch (e) {
  console.error("❌ Mongoose error pooling:", e);
  process.exit(1);
}
