// // Express and Database Setup
import express from "express";
import bodyParser from "body-parser";
import pool from "./db/configs/db.config.js";
require("dotenv").config();

const cors = require("cors");

const PORT = process.env.SERVER_PORT || 8080;

const app = express();

// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "http://localhost:5173" }));

// Resource Routes
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");

// Resource Mounting
app.use("/user", profileRoutes(pool));
app.use("/testimonial", testimonialRoutes(pool));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
