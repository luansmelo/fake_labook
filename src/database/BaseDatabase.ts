import { knex } from "knex";

export abstract class BaseDatabase {
  protected static conn = BaseDatabase.createConnection();

  static get connection() {
    return this.conn;
  }

  static get conection() {
    return this.conn;
  }

  private static createConnection() {
    return knex({
      client: "sqlite3",
      connection: {
        filename: ":memory:",
      },
      useNullAsDefault: true,
      pool: {
        min: 0,
        max: 1,
        afterCreate: (conn: any, cb: any) => {
          conn.run("PRAGMA foreign_keys = ON", cb);
        },
      },
    });
  }
}
