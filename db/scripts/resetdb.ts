require("dotenv").config();
const { Client } = require("pg");
const SCHEMA_PATH = "./db/schema";
const SEEDS_PATH = "./db/seeds";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;
const fs = require("fs").promises;

const connObj = {
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  port: DB_PORT,
  database: DB_DATABASE,
};

const client = new Client(connObj);

const runMigrations = async () => {
  const migrations = await fs.readdir(SCHEMA_PATH);
  for (let migration of migrations) {
    const migrationFile = await fs.readFile(
      `${SCHEMA_PATH}/${migration}`,
      "utf8"
    );
    console.log(`Running ${migration}`);
    await client.query(migrationFile);
  }
};

const runSeeds = async () => {
  const seeds = await fs.readdir(SEEDS_PATH);
  for (let seed of seeds) {
    const seedFile = await fs.readFile(`${SEEDS_PATH}/${seed}`, "utf8");
    console.log(`Running ${seed}`);
    await client.query(seedFile);
  }
};

const resetDB = async () => {
  try {
    console.log("Running DB Reset...\n");
    console.log("Establishing DB Connection...");

    await client.connect();
    console.log("Connection Established!\n");

    console.log("-- Running Migrations --\n");
    await runMigrations();
    console.log("\n");
    console.log("-- Running Seeds --\n");
    await runSeeds();
    console.log("\n");
    console.log("-- COMPLETED --");
    client.end();
  } catch (e) {
    console.log("ERROR OCCURED:\n", e);
    client.end();
  }
};

resetDB();
