import { object, enum as enumType, string } from "zod";
import { jsonStringifyFormatted } from "common";

const schema = object({
  VITE_API_URL: string().default("http://localhost:3000"),
  NODE_ENV: enumType(["production", "development", "test"]).default(
    "development"
  ),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    jsonStringifyFormatted(parsed.error.format())
  );
  process.exit(1);
}

export default parsed.data;
