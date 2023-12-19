import express from "express";
const router = express.Router();
const authorization = require("../middleware/authorization");
import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";

module.exports = (pool: Pool) => {
  /* GET all users */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const data = await pool.query(`SELECT * FROM users`);
      res.status(200).send(data.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  });

  router.post("/", authorization, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, gender, bodyweight, roundDown } =
        req.body;
      const requiredFields = [firstName, lastName, email];
      const valid = requiredFields.every((field) => Boolean(field));

      if (!valid) {
        return res.status(400).json({ error: "Missing Required Fields" });
      }

      const data = await pool.query(
        `UPDATE users SET first_name = $1, last_name = $2, email = $3, gender = $4, bodyweight = $5, round_down = $6 WHERE id = $7;`,
        [
          firstName,
          lastName,
          email.toLowerCase(),
          gender,
          bodyweight,
          roundDown,
          req.user,
        ]
      );
      res
        .status(200)
        .json({ message: "Successfully Updated Profile Information!" });
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Adding Profile Information");
    }
  });

  return router;
};
