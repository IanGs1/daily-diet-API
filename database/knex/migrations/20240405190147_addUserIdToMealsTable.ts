import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", schema => {
    schema.uuid("user_id").index();
    schema.foreign("user_id").references("id").inTable("users");
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("meals", schema => {
    schema.dropColumn("user_id");
  })
}

