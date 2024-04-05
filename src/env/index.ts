import { config } from "dotenv";

import { z } from "zod";

if (process.env.NODE_ENVIRONMENT === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENVIRONMENT: z.enum(["development", "test", "production"]).default("development"),
  
  PORT: z.number().default(3333),
  DATABASE_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(`Something strange happend to the Environment Variables: ${_env.error.format()}`);

  throw new Error("Something strange happend to the Environment Variables! Take a look at the .example.env archive!");
}

const env = _env.data;

export default env;