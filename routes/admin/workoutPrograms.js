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
    router.post("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { programName } = req.body;
        try {
            const response = yield pool.query(`INSERT INTO workout_programs (name) VALUES ($1) RETURNING id, name`, [programName]);
            res.status(201).json({
                message: "Successfully Created New Workout Program",
                workoutProgram: response.rows[0],
            });
        }
        catch (err) {
            console.log(err);
            const error = err;
            if ((error === null || error === void 0 ? void 0 : error.code) === "23505") {
                res.status(500).json({ error: "Workout Program Name Already Exists" });
            }
            else {
                res
                    .status(500)
                    .json({ error: "Server Error Creating New Workout Program" });
            }
        }
    }));
    router.delete("/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workoutProgram = yield pool.query(`DELETE FROM workout_programs WHERE id = $1`, [req.params.id]);
            res.status(200).json({
                message: "Successfully Deleted Workout Program",
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Error Deleting Workout Program" });
        }
    }));
    router.put("/microcycle/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { phaseInput } = req.body;
        try {
            const microcycle = yield pool.query(`UPDATE microcycles SET phase = $1 WHERE id = $2 RETURNING phase, id, microcycle_number AS "microcycleNumber"`, [phaseInput, req.params.id]);
            res.status(200).json({
                message: "Successfully Updated Microcycle Phase",
                microcycle: microcycle.rows[0],
            });
        }
        catch (err) {
            console.error(err);
            res
                .status(500)
                .json({ error: "Server Error Updating Microcycle Phase" });
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
    router.put("/exercise", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, exerciseName, sets, reps, rpe, percentage, dailyWorkoutId } = req.body;
        const sanitizedParams = {
            rpe: rpe || null,
            percentage: percentage || null,
            exerciseName: exerciseName.trimEnd(),
        };
        // Check for existing exercise and variant and assign the same type, if not default to accessory exercise
        let type = "accessory";
        let variant;
        const exerciseType = yield pool.query("SELECT type, variant FROM exercises WHERE name = $1 AND type IS NOT NULL LIMIT 1", [sanitizedParams.exerciseName]);
        if (exerciseType.rows.length > 0) {
            type = exerciseType.rows[0].type;
            variant = exerciseType.rows[0].variant;
        }
        try {
            yield pool.query("BEGIN");
            let exercise;
            const existingExercise = yield pool.query(`SELECT id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type, variant
          FROM exercises 
          WHERE name = $1 AND number_sets = $2 AND number_reps = $3 AND variant = $4 
            AND (rpe = $5 OR ($5 IS NULL AND rpe IS NULL))
            AND (percentage = $6 OR ($6 IS NULL AND percentage IS NULL))
          LIMIT 1`, [
                sanitizedParams.exerciseName,
                sets,
                reps,
                variant,
                sanitizedParams.rpe,
                sanitizedParams.percentage,
            ]);
            if (existingExercise.rows.length > 0) {
                exercise = existingExercise;
            }
            else {
                exercise = yield pool.query(`INSERT INTO exercises (name, number_sets, number_reps, rpe, percentage, type, variant) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type, variant`, [
                    sanitizedParams.exerciseName,
                    sets,
                    reps,
                    sanitizedParams.rpe,
                    sanitizedParams.percentage,
                    type,
                    variant,
                ]);
            }
            const exerciseId = exercise.rows[0].id;
            let action;
            let dailyWorkout;
            if (id) {
                dailyWorkout = yield pool.query(`UPDATE daily_workout_exercises SET exercise_id = $1 WHERE id = $2  RETURNING id`, [exerciseId, id]);
                action = "update";
            }
            else {
                yield pool.query(`INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id) VALUES ($1, $2)`, [dailyWorkoutId, exerciseId]);
                action = "create";
            }
            yield pool.query("COMMIT");
            let response = {
                code: 0,
                message: "",
                dailyWorkoutId: undefined,
            };
            if (action === "create") {
                response.code = 201;
                response.message = "Successfully Created New Exercise";
            }
            else if (action === "update") {
                response.code = 200;
                response.message = "Successfully Updated Exercise";
                response.dailyWorkoutId = dailyWorkout.rows[0].id;
            }
            res.status(response.code).json({
                message: response.message,
                exercise: exercise.rows[0],
                dailyWorkoutId: response.dailyWorkoutId,
            });
        }
        catch (err) {
            yield pool.query("ROLLBACK");
            console.error(err);
            res.status(500).json({ error: "Server Error Creating New Exercise" });
        }
    }));
    router.delete("/exercise/:id", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const exercise = yield pool.query(`DELETE FROM daily_workout_exercises WHERE id = $1`, [req.params.id]);
            res.status(200).json({
                message: "Successfully Deleted Exercise",
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Error Deleting Exercise" });
        }
    }));
    router.post("/copy_previous_week", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { previousMicrocycleId, newMicrocycleId } = req.body;
            yield pool.query("BEGIN");
            // Fetch all daily workouts that match the previous microcycle id that is passed in
            const copiedDailyWorkouts = yield pool.query(`SELECT id FROM daily_workouts WHERE microcycle_id = $1`, [previousMicrocycleId]);
            const response = [];
            // Create a new daily workout for each fetched daily workout with the new microcycle id as the foreign key
            for (let i = 0; i < copiedDailyWorkouts.rows.length; i++) {
                const dailyWorkout = yield pool.query(`INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2) RETURNING id, day_number AS "dayNumber", microcycle_id AS "microcycleId"`, [i + 1, newMicrocycleId]);
                response.push(dailyWorkout.rows[0]);
                //   // Fetch all workout exercises for each existing microcycle that is being copied
                //   const workoutExercises = await pool.query(
                //     `SELECT exercises.id, name, number_sets, number_reps, rpe, percentage, type, variant
                //     FROM exercises
                //     JOIN daily_workout_exercises ON exercises.id = daily_workout_exercises.exercise_id
                //     WHERE daily_workout_id = $1;`,
                //     [copiedDailyWorkouts.rows[i].id]
                //   );
                //   // Insert the copied exercises into each new daily workout
                //   for (let j = 0; j < workoutExercises.rows.length; j++) {
                //     await pool.query(
                //       `INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id) VALUES ($1, $2)`,
                //       [dailyWorkout.rows[0].id, workoutExercises.rows[j].id]
                //     );
                //   }
            }
            console.log(response);
            yield pool.query("COMMIT");
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Error Copying Microcycle" });
        }
    }));
    return router;
};
