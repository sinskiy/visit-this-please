import { object, coerce, enum as enumType } from "zod";
import { jsonStringifyFormatted } from "common";

const schema = object({
  PORT: coerce.number().int().positive().default(3000),
  NODE_ENV: enumType(["production", "development", "test"]).default(
    "development"
  ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    jsonStringifyFormatted(parsed.error.format())
  );
  process.exit(1);
}

export default parsed.data;
