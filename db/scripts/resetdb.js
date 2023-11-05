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
