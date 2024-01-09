import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get(
    "/microcycle/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const microcycles = await pool.query(
          `SELECT 
            microcycle_number AS "microcycleNumber", 
            phase,
            id
          FROM 
            microcycles
          WHERE 
            workout_program_id = $1
          ORDER BY 
            id`,
          [req.params.id]
        );

        res.json(microcycles.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Microcycles");
      }
    }
  );

  router.get(
    "/daily_workout/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const dailyWorkouts = await pool.query(
          `SELECT 
            day_number AS "dayNumber", 
            id,
            microcycle_id AS "microcycleId"
          FROM 
            daily_workouts
          WHERE 
            microcycle_id = $1`,
          [req.params.id]
        );

        res.json(dailyWorkouts.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Daily Workouts");
      }
    }
  );

  router.get(
    "/exercise_list/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const exercises = await pool.query(
          `SELECT 
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
            workout_exercises.id`,
          [req.params.id]
        );

        res.json(exercises.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Exercise List");
      }
    }
  );

  return router;
};
