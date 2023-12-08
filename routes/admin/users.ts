import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const users = await pool.query(
        'SELECT first_name AS "firstName", last_name AS "lastName", email, id, gender, bodyweight, workout_program_id AS "WorkoutProgramId" FROM users'
      );

      res.json(users.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching Users");
    }
  });

  return router;
};
