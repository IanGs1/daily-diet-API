import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", schema => {
    schema.uuid("id").primary();

    schema.text("name");

    schema.text("email");
    schema.text("password");

    schema.uuid("session_id").index();
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}