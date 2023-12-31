import express from "express";
import { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utilities/jwtGenerator");
const validInfo = require("../middleware/loginValidation");
const authorization = require("../middleware/authorization");

module.exports = (pool: Pool) => {
  /* REGISTRATION */
  router.post("/register", validInfo, async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email.toLowerCase(),
      ]);

      if (user.rows.length !== 0) {
        return res.status(401).send("User Already Exists");
      }

      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);

      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [firstName, lastName, email.toLowerCase(), hashedPassword]
      );

      const token = jwtGenerator(newUser.rows[0].id);

      res.json({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error User Creation");
    }
  });

  /* LOGIN */
  router.post("/login", validInfo, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await pool.query(
        'SELECT first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId",  password, roles FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (user.rows.length === 0) {
        return res.status(401).json("Password or Email is incorrect");
      }

      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );

      if (!validPassword) {
        return res.status(401).json("Password or Email is incorrect");
      }

      const token = jwtGenerator(user.rows[0].id);

      res.json({ token: token, user: user.rows[0] });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error User Login");
    }
  });

  router.get(
    "/is-verified",
    authorization,
    async (req: Request, res: Response) => {
      try {
        const user = await pool.query(
          'SELECT roles, first_name AS "firstName", last_name AS "lastName", email, gender, bodyweight, id, workout_program_id AS "workoutProgramId" FROM users WHERE id = $1',
          [req.user]
        );

        res.json(user.rows[0]);
      } catch (err) {
        console.log(err);
        res.status(500).send("Server Error Checking Authorization");
      }
    }
  );

  return router;
};
