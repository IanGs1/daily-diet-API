import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", schema => {
    schema.uuid("id").primary();

    schema.text("name");
    schema.text("description");

    schema.boolean("is_in_the_diet");

     schema.timestamp("created_at").defaultTo(knex.fn.now());
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("meals");
}