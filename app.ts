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
const authenticationRoutes = require("./routes/jwtAuth");
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");
const dashboardRoutes = require("./routes/dashboard.js");
const workoutProgramRoutes = require("./routes/workoutprogram.js");

// Admin Resource Routes
const adminUserRoutes = require("./routes/admin/users.js");

// Resource Mounting
app.use("/auth", authenticationRoutes(pool));
app.use("/dashboard", dashboardRoutes(pool));
app.use("/user", profileRoutes(pool));
app.use("/testimonial", testimonialRoutes(pool));
app.use("/workout-program", workoutProgramRoutes(pool));

// Admin Resource Mounting
app.use("/admin/user", adminUserRoutes(pool));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
