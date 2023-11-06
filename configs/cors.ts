import { Application } from "express";

const cors = require("cors");

const configureCors = (app: Application) => {
  if (process.env.NODE_ENV === "development") {
    app.use(cors({ origin: "http://localhost:3000" }));
  }
  app.use(cors({ origin: "https://ellyan.netlify.app" }));
};

export default configureCors;
