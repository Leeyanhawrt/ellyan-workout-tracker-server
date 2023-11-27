import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const user = await pool.query(
        'SELECT first_name AS "firstName", last_name AS "lastName", email, id, workout_program_id AS "workoutProgramId" FROM users WHERE id = $1',
        [req.user]
      );

      res.json(user.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching Dashboard");
    }
  });

  router.get(
    "/orm-records",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const record = await pool.query(
          `SELECT 
            squat_record AS "squatRecord", 
            bench_record AS "benchRecord", 
            deadlift_record AS "deadliftRecord" 
          FROM personal_records 
            WHERE user_id = $1    
          ORDER BY 
            created_at DESC`,
          [req.user]
        );

        res.status(200).json(record.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Fetching User Records");
      }
    }
  );

  router.post(
    "/orm-records",
    authorization,
    async (req: Request, res: Response) => {
      let { squatRecord, benchRecord, deadliftRecord } = req.body;

      squatRecord = squatRecord || 0;
      benchRecord = benchRecord || 0;
      deadliftRecord = deadliftRecord || 0;

      try {
        const response = await pool.query(
          "INSERT INTO personal_records (squat_record, bench_record, deadlift_record, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [squatRecord, benchRecord, deadliftRecord, req.user]
        );

        res
          .status(201)
          .json({ message: "Successfully Entered New Personal Record!" });
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Updating ORM");
      }
    }
  );

  return router;
};
