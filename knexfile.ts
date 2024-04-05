import { Knex } from "knex";

import env from "./src/env";

export = {
  client: "sqlite3",
  connection: env.DATABASE_URL,
  migrations: {
    directory: "./database/knex/migrations",
    extension: "ts",
  },
  useNullAsDefault: true,
} as Knex.Config