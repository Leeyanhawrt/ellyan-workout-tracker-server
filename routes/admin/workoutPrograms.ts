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
          "INSERT INTO microcycles (microcycle_number, workout_program_id) VALUES ($1, $2) RETURNING *",
          [microcycleNumber + 1, workoutProgramId]
        );

        res.json({
          message: "Successfully Created New Microcycle",
          data: response.rows[0],
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

  return router;
};
