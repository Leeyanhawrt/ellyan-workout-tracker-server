import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const workoutPrograms = await pool.query(
        `SELECT id, name FROM workout_programs;`
      );

      res.json(workoutPrograms.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Workout Programs");
    }
  });

  router.post(
    "/microcycle",
    authorization,
    async (req: Request, res: Response) => {
      const { microcycleNumber, workoutProgramId } = req.body;

      try {
        const response = await pool.query(
          `INSERT INTO microcycles (microcycle_number, workout_program_id) VALUES ($1, $2) RETURNING id, microcycle_number AS "microcycleNumber"`,
          [microcycleNumber + 1, workoutProgramId]
        );

        res.json({
          message: "Successfully Created New Microcycle",
          microcycle: response.rows[0],
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error Creating New Microcycle" });
      }
    }
  );

  router.get(
    "/microcycle/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const microcycles = await pool.query(
          `SELECT microcycle_number AS "microcycleNumber", id FROM microcycles WHERE workout_program_id = $1`,
          [req.params.id]
        );

        res.json(microcycles.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Admin Microcycles");
      }
    }
  );

  router.post(
    "/daily_workout",
    authorization,
    async (req: Request, res: Response) => {
      const { dayNumber, microcycleId } = req.body;

      try {
        const response = await pool.query(
          `INSERT INTO daily_workouts (day_number, microcycle_id) VALUES ($1, $2) RETURNING id, day_number AS "dayNumber"`,
          [dayNumber + 1, microcycleId]
        );

        res.status(201).json({
          message: "Successfully Created New Daily Workout",
          dailyWorkout: response.rows[0],
        });
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "Server Error Creating New Daily Workout" });
      }
    }
  );

  router.post(
    "/exercise",
    authorization,
    async (req: Request, res: Response) => {
      const { exerciseName, sets, reps, rpe, percentage, dailyWorkoutId } =
        req.body;

      // Check for existing exercise and assign the same type, if not default to accessory exercise
      let type = "accessory";

      const exerciseType = await pool.query(
        "SELECT type FROM exercises WHERE name = $1 AND type IS NOT NULL LIMIT 1",
        [exerciseName]
      );

      if (exerciseType.rows.length > 0) {
        type = exerciseType.rows[0].type;
      }

      const sanitizedParams = {
        rpe: rpe || null,
        percentage: percentage || null,
      };

      try {
        await pool.query("BEGIN");

        const exercise = await pool.query(
          `INSERT INTO exercises (name, number_sets, number_reps, rpe, percentage, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, number_sets AS "numberSets", number_reps AS "numberReps", rpe, percentage, type`,
          [
            exerciseName,
            sets,
            reps,
            sanitizedParams.rpe,
            sanitizedParams.percentage,
            type,
          ]
        );

        const exerciseId = exercise.rows[0].id;

        const dailyWorkoutProgram = await pool.query(
          `INSERT INTO daily_workout_exercises (daily_workout_id, exercise_id) VALUES ($1, $2)`,
          [dailyWorkoutId, exerciseId]
        );

        await pool.query("COMMIT");

        res.status(201).json({
          message: "Successfully Created New Exercise",
          dailyWorkout: exercise.rows[0],
        });
      } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Server Error Creating New Exercise" });
      }
    }
  );

  router.delete(
    "/exercise/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const exercise = await pool.query(
          `DELETE FROM daily_workout_exercises WHERE id = $1`,
          [req.params.id]
        );

        res.status(200).json({
          message: "Successfully Deleted Exercise",
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error Deleting Exercise" });
      }
    }
  );

  return router;
};
