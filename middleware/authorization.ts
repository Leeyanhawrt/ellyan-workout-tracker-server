import { Request, Response, NextFunction } from "express";

require("dotenv").config();

const jwt = require("jsonwebtoken");

declare module "express" {
  interface Request {
    user?: User;
  }
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

module.exports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(403).json("Not Authorized");
    }

    const verify = jwt.verify(jwtToken, process.env.JWT_SECRET_ACCESS_KEY);

    req.user = verify.user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json("Token Invalid");
  }
};
