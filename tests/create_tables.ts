import { BaseDatabase } from "../src/database/BaseDatabase";

async function createTables() {
  await BaseDatabase.connection.schema.createTable("users", (table) => {
    table.string("id").primary().notNullable().unique();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("role").notNullable();
    table
      .string("created_at")
      .defaultTo(BaseDatabase.connection.fn.now())
      .notNullable();
  });

  await BaseDatabase.connection.schema.createTable("posts", (table) => {
    table.string("id").primary().notNullable().unique();
    table.string("creator_id").notNullable();
    table.string("content").notNullable();
    table.integer("likes").notNullable();
    table.integer("dislikes").notNullable();
    table
      .string("created_at")
      .defaultTo(BaseDatabase.connection.fn.now())
      .notNullable();
    table
      .string("updated_at")
      .defaultTo(BaseDatabase.connection.fn.now())
      .notNullable();
    table.foreign("creator_id").references("id").inTable("users");
  });

  await BaseDatabase.connection.schema.createTable(
    "likes_dislikes",
    (table) => {
      table.string("user_id").notNullable();
      table.string("post_id").notNullable();
      table.integer("like").notNullable();
      table.foreign("user_id").references("id").inTable("users");
      table.foreign("post_id").references("id").inTable("posts");
    }
  );
}

export default createTables;
