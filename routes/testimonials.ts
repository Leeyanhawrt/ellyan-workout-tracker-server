import express from "express";
const router = express.Router();
import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";

module.exports = (pool: Pool) => {
  /* GET all testimonials */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const data = await pool.query(`SELECT * FROM testimonials`);
      res.status(200).send(data.rows);
    } catch (err) {
      console.log(err);
    }
  });

  return router;
};
