import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const authorization = require("../middleware/authorization");

module.exports = (pool: Pool) => {
  router.get("/", authorization, async (req: Request, res: Response) => {
    try {
      const user = await pool.query(
        'SELECT first_name AS "firstName", last_name AS "lastName" FROM users WHERE id = $1',
        [req.user]
      );

      res.json(user.rows[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Fetching Dashboard");
    }
  });

  router.post(
    "/update-orm",
    authorization,
    async (req: Request, res: Response) => {
      const { squatMax, benchMax, deadliftMax } = req.body;
      try {
        const response = await pool.query(
          "INSERT INTO personal_records (squat_max, bench_max, deadlift_max, id) VALUES ($1, $2, $3, $4) RETURNING *",
          [squatMax, benchMax, deadliftMax, req.user?.id]
        );

        res.status(201).json("Successfully Entered New Personal Record!");
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error Updating ORM");
      }
    }
  );

  return router;
};
