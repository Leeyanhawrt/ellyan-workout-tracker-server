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
            const workoutPrograms = yield pool.query(`SELECT id, name FROM workout_programs;`);
            res.json(workoutPrograms.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Workout Programs");
        }
    }));
    router.post("/microcycle", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { microcycleNumber, workoutProgramId } = req.body;
        try {
            const response = yield pool.query("INSERT INTO microcycles (microcycle_number, workout_program_id) VALUES ($1, $2) RETURNING id, microcycle_number", [microcycleNumber + 1, workoutProgramId]);
            res.json({
                message: "Successfully Created New Microcycle",
                data: response.rows[0],
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Server Error Creating New Microcycle" });
        }
    }));
    router.get("/microcycle/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const microcycles = yield pool.query(`SELECT microcycle_number AS "microcycleNumber", id FROM microcycles WHERE workout_program_id = $1`, [req.params.id]);
            res.json(microcycles.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Admin Microcycles");
        }
    }));
    return router;
};
