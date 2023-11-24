"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const SCHEMA_PATH = "./db/schema";
const SEEDS_PATH = "./db/seeds";
const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT, NODE_ENV } = process.env;
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
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRound = 10;
    const salt = yield bcrypt.genSalt(saltRound);
    const hashedPassword = yield bcrypt.hash(password, salt);
    return hashedPassword;
});
const seedUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const firstName = "Leeyan";
    const lastName = "Haw";
    const email = "leeyan1108@gmail.com";
    const password = "123123";
    const workoutProgram = 1;
    try {
        const hashedPassword = yield hashPassword(password);
        const result = yield client.query("INSERT INTO users (first_name, last_name, email, password, workout_program_id) VALUES ($1, $2, $3, $4, $5)", [firstName, lastName, email, hashedPassword, workoutProgram]);
        console.log("Example User Seeded!");
    }
    catch (err) {
        console.error("Error seeding user:", err);
    }
});
const runMigrations = () => __awaiter(void 0, void 0, void 0, function* () {
    const migrations = yield fs.readdir(SCHEMA_PATH);
    for (let migration of migrations) {
        const migrationFile = yield fs.readFile(`${SCHEMA_PATH}/${migration}`, "utf8");
        console.log(`Running ${migration}`);
        yield client.query(migrationFile);
    }
});
const runSeeds = () => __awaiter(void 0, void 0, void 0, function* () {
    const seeds = yield fs.readdir(SEEDS_PATH);
    for (let seed of seeds) {
        const seedFile = yield fs.readFile(`${SEEDS_PATH}/${seed}`, "utf8");
        console.log(`Running ${seed}`);
        yield client.query(seedFile);
    }
});
const resetDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Running DB Reset...\n");
        console.log("Establishing DB Connection...");
        yield client.connect();
        console.log("Connection Established!\n");
        console.log("-- Running Migrations --\n");
        yield runMigrations();
        console.log("\n");
        console.log("-- Running Seeds --\n");
        yield seedUser();
        yield runSeeds();
        console.log("\n");
        console.log("-- COMPLETED --");
        client.end();
    }
    catch (e) {
        console.log("ERROR OCCURED:\n", e);
        client.end();
    }
});
resetDB();
