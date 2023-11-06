"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Database connections
const pg_1 = require("pg");
require("dotenv").config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
let pool;
if (process.env.DATABASE_URL) {
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL || "",
        ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    });
}
else {
    pool = new pg_1.Pool({
        user: DB_USER,
        host: DB_HOST,
        password: DB_PASSWORD,
        port: parseInt(DB_PORT),
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
exports.default = pool;
