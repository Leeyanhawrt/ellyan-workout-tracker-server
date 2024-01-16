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
    router.get("/microcycle/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const microcycles = yield pool.query(`SELECT 
            microcycle_number AS "microcycleNumber", 
            phase,
            id
          FROM 
            microcycles
          WHERE 
            workout_program_id = $1
          ORDER BY 
            id`, [req.params.id]);
            res.json(microcycles.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Microcycles");
        }
    }));
    console.log("Figure out delayed loading");
    router.get("/daily_workout/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const dailyWorkouts = yield pool.query(`SELECT 
            day_number AS "dayNumber", 
            id,
            microcycle_id AS "microcycleId"
          FROM 
            daily_workouts
          WHERE 
            microcycle_id = $1`, [req.params.id]);
            res.json(dailyWorkouts.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Daily Workouts");
        }
    }));
    router.get("/user_workout/:userId/:workoutExerciseId", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userWorkout = yield pool.query(`SELECT rpe AS "userRpe" FROM user_workouts WHERE workout_exercise_id = $1 AND user_id = $2`, [req.params.workoutExerciseId, req.params.userId]);
            res.json(userWorkout.rows[0]);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching User Workouts");
        }
    }));
    router.put("/user_workout/:workoutExerciseId", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userRpe } = req.body;
        const rpeArray = userRpe.trimEnd().split(" ").map(Number);
        let validArray = true;
        let response = {
            error: "",
        };
        const rpeOverBounderies = rpeArray.some((value) => {
            return value > 10 || value < 1;
        });
        const nonNumber = rpeArray.some((value) => {
            return isNaN(value);
        });
        const decimalRegex = /^(|([1-9]|10|10\.0|10\.5|[1-9](\.0|\.5)?))$/;
        const validDecimal = rpeArray.every((value) => {
            return decimalRegex.test(value.toString());
        });
        if (!validDecimal) {
            validArray = false;
            response.error =
                "Invalid RPE input. Please enter a number between 1 and 10, in 0.5 increments.";
        }
        if (rpeOverBounderies) {
            validArray = false;
            response.error = "RPE Can't Be > 10 Or < 1";
        }
        if (nonNumber) {
            validArray = false;
            response.error = "RPE Can Only Be A Number";
        }
        if (!validArray) {
            return res.status(500).json({ error: response.error });
        }
        try {
            const updatedUserWorkout = yield pool.query(`UPDATE user_workouts SET rpe = $1::decimal[] WHERE user_id = $2 AND workout_exercise_id = $3 RETURNING rpe AS "userRpe"`, [rpeArray, req.user, req.params.workoutExerciseId]);
            if (updatedUserWorkout.rows.length > 0) {
                return res.status(200).json({
                    message: "Successfully Updated RPE",
                    userWorkout: updatedUserWorkout.rows[0],
                });
            }
            const newUserWorkout = yield pool.query(`INSERT INTO user_workouts (rpe, user_id, workout_exercise_id) VALUES ($1, $2, $3) RETURNING rpe AS "userRpe"`, [rpeArray, req.user, req.params.workoutExerciseId]);
            res.status(201).json({
                message: "Successfully Inputted RPE",
                userWorkout: newUserWorkout.rows[0],
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Error Updating RPE" });
        }
    }));
    router.get("/exercise_list/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const exercises = yield pool.query(`SELECT 
            workout_exercises.id,
            name, 
            sets,
            reps,
            rpe,
            percentage,
            type,
            variant
          FROM 
            workout_exercises
          JOIN
            exercises ON workout_exercises.exercise_id = exercises.id
          WHERE 
            daily_workout_id = $1
          ORDER BY
            CASE
              WHEN name = 'Bench Press' THEN 1
              WHEN name = 'Squat' THEN 2
              WHEN name = 'Deadlift' THEN 3
              WHEN type = 'main variation' THEN 4
              WHEN type = 'accessory' THEN 5
              ELSE 6
            END,
            workout_exercises.id`, [req.params.id]);
            res.json(exercises.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Exercise List");
        }
    }));
    return router;
};
