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
const authorization = require("../middleware/authorization");
module.exports = (pool) => {
    router.get("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield pool.query('SELECT first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId" FROM users WHERE id = $1', [req.user]);
            res.json(user.rows[0]);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Dashboard");
        }
    }));
    router.get("/orm-records", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const record = yield pool.query(`SELECT 
            squat, 
            bench, 
            deadlift 
          FROM personal_records 
            WHERE user_id = $1    
          ORDER BY 
            created_at DESC`, [req.user]);
            res.status(200).json(record.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching User Records");
        }
    }));
    router.post("/orm-records", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { squat, bench, deadlift } = req.body;
        squat = squat || 0;
        bench = bench || 0;
        deadlift = deadlift || 0;
        try {
            const response = yield pool.query("INSERT INTO personal_records (squat, bench, deadlift, user_id) VALUES ($1, $2, $3, $4) RETURNING *", [squat, bench, deadlift, req.user]);
            res
                .status(201)
                .json({ message: "Successfully Entered New Personal Record!" });
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Updating ORM");
        }
    }));
    return router;
};
