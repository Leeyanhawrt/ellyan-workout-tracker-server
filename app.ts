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
const oAuthRoutes = require("./routes/oAuth");
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");
const dashboardRoutes = require("./routes/dashboard");
const workoutProgramRoutes = require("./routes/workoutPrograms");

// Admin Resource Routes
const adminUserRoutes = require("./routes/admin/users");
const adminWorkoutProgramsRoutes = require("./routes/admin/workoutPrograms");

// Resource Mounting
app.use("/auth", authenticationRoutes(pool));
app.use("/dashboard", dashboardRoutes(pool));
app.use("/user", profileRoutes(pool));
app.use("/testimonial", testimonialRoutes(pool));
app.use("/workout_program", workoutProgramRoutes(pool));
app.use("/oAuth", oAuthRoutes(pool));

// Admin Resource Mounting
app.use("/admin/users", adminUserRoutes(pool));
app.use("/admin/workout_programs", adminWorkoutProgramsRoutes(pool));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
