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

  return router;
};
