import { Place, User } from "./config.ts";

try {
  await User.deleteMany();
  await Place.deleteMany();
} catch (e) {
  console.error("❌ Mongoose error seeding:", e);
  process.exit(1);
}
