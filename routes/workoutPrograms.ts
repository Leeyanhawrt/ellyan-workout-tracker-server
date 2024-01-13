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

  console.log("Figure out delayed loading");

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
            daily_workout_exercises.id,
            name, 
            number_sets AS "numberSets",
            number_reps AS "numberReps",
            rpe,
            percentage,
            type,
            variant
          FROM 
            daily_workout_exercises
          JOIN
            exercises ON daily_workout_exercises.exercise_id = exercises.id
          WHERE 
            daily_workout_id = $1
          ORDER BY
            CASE
              WHEN type = 'main' THEN 1
              WHEN type = 'main variation' THEN 2
              WHEN type = 'accessory' THEN 3
              ELSE 4 
            END,
            daily_workout_exercises.id`,
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
