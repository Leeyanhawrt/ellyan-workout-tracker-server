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
const authorization = require("../../middleware/authorization");
module.exports = (pool) => {
    router.get("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield pool.query(`SELECT 
          first_name AS "firstName", 
          last_name AS "lastName",
          email,
          users.id,
          gender, 
          workout_programs.name AS "workoutProgramName" 
        FROM users
        LEFT JOIN workout_programs ON users.workout_program_id = workout_programs.id
        ORDER BY users.id;`);
            res.json(users.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Users");
        }
    }));
    router.get("/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield pool.query('SELECT first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId" FROM users WHERE id = $1', [req.params.id]);
            res.json(user.rows[0]);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching User Data");
        }
    }));
    router.post("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { workoutProgramId, userId } = req.body;
            const response = yield pool.query(`UPDATE users SET workout_program_id = $1 WHERE id = $2;`, [workoutProgramId, userId]);
            res.status(201).json({ message: "Successfully Edited User Details!" });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Server Error Editing User Deatils" });
        }
    }));
    return router;
};
