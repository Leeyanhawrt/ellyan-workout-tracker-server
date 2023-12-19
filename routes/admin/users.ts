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
          workout_programs.name AS "workoutProgramName" 
        FROM users
        LEFT JOIN workout_programs ON users.workout_program_id = workout_programs.id
        ORDER BY users.id;`
      );

      res.json(users.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching Users");
    }
  });

  router.get(
    "/workout_programs",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const workoutPrograms = await pool.query(
          `SELECT id, name FROM workout_programs;`
        );

        res.json(workoutPrograms.rows);
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Workout Programs");
      }
    }
  );

  router.get("/:id", authorization, async (req: Request, res: Response) => {
    try {
      const user = await pool.query(
        'SELECT first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId", round_down AS "roundDown" FROM users WHERE id = $1',
        [req.params.id]
      );

      res.json(user.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching User Data");
    }
  });

  router.post("/", authorization, async (req: Request, res: Response) => {
    try {
      const { workoutProgramId, userId, roundDown } = req.body;

      const response = await pool.query(
        `UPDATE users SET workout_program_id = $1, round_down = $2 WHERE id = $3;`,
        [workoutProgramId, roundDown, userId]
      );

      res.status(201).json({ message: "Successfully Edited User Details!" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server Error Editing User Deatils" });
    }
  });

  return router;
};
