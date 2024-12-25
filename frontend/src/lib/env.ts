import { object, enum as enumType, string } from "zod";

const schema = object({
  VITE_API_URL: string(),
  NODE_ENV: enumType(["production", "development", "test"]).default(
    "development"
  ),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error("❌ Invalid environment variables: " + parsed.error.format());
}

export default parsed.data;
