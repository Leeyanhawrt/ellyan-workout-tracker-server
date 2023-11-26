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
            id 
          FROM 
            microcycles
          WHERE 
            workout_program_id = $1`,
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
    "/daily-workout/:id",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const microcycles = await pool.query(
          `SELECT 
            day_number AS "dayNumber", 
            id 
          FROM 
            daily_workouts
          WHERE 
            microcycle_id = $1`,
          [req.params.id]
        );

        res.json(microcycles.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching Daily-Workouts");
      }
    }
  );

  return router;
};
