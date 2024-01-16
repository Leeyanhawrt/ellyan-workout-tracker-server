import { error } from "console";

require("dotenv").config();
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const SCHEMA_PATH = "./db/schema";
const SEEDS_PATH = "./db/seeds";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT, NODE_ENV } =
  process.env;
const fs = require("fs").promises;

const connObj = {
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  port: DB_PORT,
  database: DB_DATABASE,
  ssl: NODE_ENV !== "development" ? { rejectUnauthorized: false } : null,
};

const client = new Client(connObj);

const hashPassword = async (password: string) => {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const seedUser = async () => {
  const firstName = "Leeyan";
  const lastName = "Haw";
  const email = "leeyan1108@gmail.com";
  const password = "123123";
  const workoutProgram = 1;
  const gender = "male";
  const bodyweight = 178;
  const roles = ["member"];

  try {
    const hashedPassword = await hashPassword(password);

    const result = await client.query(
      "INSERT INTO users (first_name, last_name, email, password, gender, bodyweight, workout_program_id, roles) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        gender,
        bodyweight,
        workoutProgram,
        roles,
      ]
    );

    console.log("Example User Seeded!");
  } catch (err) {
    console.error("Error seeding user:", err);
  }
};

const runMigrations = async () => {
  const migrations = await fs.readdir(SCHEMA_PATH);
  const reversedMigrations = migrations.reverse();

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
    await seedUser();
    console.log("\n");
    console.log("-- COMPLETED --");
    client.end();
  } catch (e) {
    console.log("ERROR OCCURED:\n", e);
    client.end();
  }
};

resetDB();
