"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // Express and Database Setup
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_config_js_1 = __importDefault(require("./db/configs/db.config.js"));
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.SERVER_PORT || 8080;
const app = (0, express_1.default)();
// Middleware functions
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cors({ origin: "http://localhost:5173" }));
// Resource Routes
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");
// Resource Mounting
app.use("/user", profileRoutes(db_config_js_1.default));
app.use("/testimonial", testimonialRoutes(db_config_js_1.default));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
