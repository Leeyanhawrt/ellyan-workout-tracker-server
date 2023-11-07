// // Express and Database Setup
import express from "express";
import bodyParser from "body-parser";
import pool from "./configs/db.config.js";
import configureCors from "./configs/cors.js";
require("dotenv").config();

const PORT = process.env.PORT || 8080;

const app = express();

// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
configureCors(app);

// Resource Routes
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");

// Resource Mounting
app.use("/user", profileRoutes(pool));
app.use("/testimonial", testimonialRoutes(pool));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
