import { hash } from "bcrypt";
import express from "express";
import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";

const router = express.Router();
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utilities/jwtGenerator");

module.exports = (pool: Pool) => {
  /* REGISTRATION */
  router.post("/register", async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length !== 0) {
        return res.status(401).send("User Already Exists");
      }

      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);

      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
        [firstName, lastName, email, hashedPassword]
      );

      const token = jwtGenerator(newUser.rows[0].id);

      res.json(token);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error User Creation");
    }
  });

  return router;
};
