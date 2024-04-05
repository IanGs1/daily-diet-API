import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string,

      name: string,
      email: string,
      password: string,

      session_id: string,
    };

    meals: {
      id: string,

      name: string,
      description: string,
      is_in_the_diet: boolean,

      user_id: string,

      created_at: Date,
    }
  }
}