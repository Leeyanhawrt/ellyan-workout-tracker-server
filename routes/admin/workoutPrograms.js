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
            const response = yield pool.query(`INSERT INTO microcycles (microcycle_number, workout_program_id) VALUES ($1, $2) RETURNING id, microcycle_number AS "microcycleNumber"`, [microcycleNumber + 1, workoutProgramId]);
            res.json({
                message: "Successfully Created New Microcycle",
                microcycle: response.rows[0],
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
    router.post("/daily_workout", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { dayNumber, microcycleId } = req.body;
        try {
            const response = yield pool.query(`INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2) RETURNING id, day_number AS "dayNumber"`, [dayNumber + 1, microcycleId]);
            res.status(201).json({
                message: "Successfully Created New Daily Workout",
                dailyWorkout: response.rows[0],
            });
        }
        catch (err) {
            console.log(err);
            res
                .status(500)
                .json({ error: "Server Error Creating New Daily Workout" });
        }
    }));
    router.post("/exercise", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { exerciseName, sets, reps, rpe, percentage, dailyWorkoutId } = req.body;
        // Check for existing exercise and assign the same type, if not default to accessory exercise
        let type = "accessory";
        const exerciseType = yield pool.query("SELECT type FROM exercises WHERE name = $1 AND type IS NOT NULL LIMIT 1", [exerciseName]);
        if (exerciseType.rows.length > 0) {
            type = exerciseType.rows[0].type;
        }
        const sanitizedParams = {
            rpe: rpe || null,
            percentage: percentage || null,
        };
        try {
            yield pool.query("BEGIN");
            const exercise = yield pool.query(`INSERT INTO exercises (name, number_sets, number_reps, rpe, percentage, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type`, [
                exerciseName,
                sets,
                reps,
                sanitizedParams.rpe,
                sanitizedParams.percentage,
                type,
            ]);
            const exerciseId = exercise.rows[0].id;
            const dailyWorkoutProgram = yield pool.query(`INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id) VALUES ($1, $2)`, [dailyWorkoutId, exerciseId]);
            yield pool.query("COMMIT");
            res.status(201).json({
                message: "Successfully Created New Exercise",
                dailyWorkout: exercise.rows[0],
            });
        }
        catch (err) {
            yield pool.query("ROLLBACK");
            console.error(err);
            res.status(500).json({ error: "Server Error Creating New Exercise" });
        }
    }));
    return router;
};
