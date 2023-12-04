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
      const { gender, weight } = req.body;
      const data = await pool.query(
        `UPDATE users SET gender = $1, bodyweight = $2 WHERE id = $3;`,
        [gender, weight, req.user]
      );
      res.status(200).send(data.rows);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error Adding Profile Information");
    }
  });

  return router;
};
