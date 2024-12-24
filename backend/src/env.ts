import { object, coerce, enum as enumType, string } from "zod";
import "dotenv/config";

const schema = object({
  PORT: coerce.number().int().positive().default(3000),
  NODE_ENV: enumType(["production", "development", "test"]).default(
    "development"
  ),
  CLIENT_URL: string(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export default parsed.data;
