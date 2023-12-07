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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utilities/jwtGenerator");
const validInfo = require("../middleware/loginValidation");
const authorization = require("../middleware/authorization");
module.exports = (pool) => {
    /* REGISTRATION */
    router.post("/register", validInfo, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, password } = req.body;
            const user = yield pool.query("SELECT * FROM users WHERE email = $1", [
                email.toLowerCase(),
            ]);
            if (user.rows.length !== 0) {
                return res.status(401).send("User Already Exists");
            }
            const saltRound = 10;
            const salt = yield bcrypt.genSalt(saltRound);
            const hashedPassword = yield bcrypt.hash(password, salt);
            const newUser = yield pool.query("INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", [firstName, lastName, email.toLowerCase(), hashedPassword]);
            const token = jwtGenerator(newUser.rows[0].id);
            res.json({ token });
        }
        catch (err) {
            console.log(err);
            res.status(500).send("Server Error User Creation");
        }
    }));
    /* LOGIN */
    router.post("/login", validInfo, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield pool.query("SELECT * FROM users WHERE email = $1", [
                email.toLowerCase(),
            ]);
            if (user.rows.length === 0) {
                return res.status(401).json("Password or Email is incorrect");
            }
            const validPassword = yield bcrypt.compare(password, user.rows[0].password);
            if (!validPassword) {
                return res.status(401).json("Password or Email is incorrect");
            }
            const token = jwtGenerator(user.rows[0].id);
            res.json({ token });
        }
        catch (err) {
            console.log(err);
            res.status(500).send("Server Error User Login");
        }
    }));
    router.get("/is-verified", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield pool.query('SELECT roles, first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId" FROM users WHERE id = $1', [req.user]);
            res.json(user.rows[0]);
        }
        catch (err) {
            console.log(err);
            res.status(500).send("Server Error Checking Authorization");
        }
    }));
    return router;
};
