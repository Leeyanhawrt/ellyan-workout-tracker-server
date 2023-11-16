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
      res.status(500).json("Server Error");
    }
  });

  return router;
};
