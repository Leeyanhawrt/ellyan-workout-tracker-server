// Database connections
import { Pool } from "pg";
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

let pool: Pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || "",
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  });
} else {
  pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT!),
    database: DB_DATABASE,
  });
}

pool
  .connect()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((e) => {
    throw new Error(e);
  });

export default pool;
