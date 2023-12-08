import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const users = await pool.query(
        `SELECT 
          first_name AS "firstName", 
          last_name AS "lastName",
          email,
          users.id,
          gender, 
          bodyweight, 
          workout_program_id AS "workoutProgramId", 
          workout_programs.name AS "workoutProgramName" 
        FROM users
        JOIN workout_programs ON users.workout_program_id = workout_programs.id;`
      );

      res.json(users.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching Users");
    }
  });

  return router;
};
