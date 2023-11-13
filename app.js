"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // Express and Database Setup
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_config_js_1 = __importDefault(require("./configs/db.config.js"));
const cors_js_1 = __importDefault(require("./configs/cors.js"));
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const app = (0, express_1.default)();
// Middleware functions
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
(0, cors_js_1.default)(app);
// Resource Routes
const authenticationRoutes = require("./routes/jwtAuth");
const profileRoutes = require("./routes/users");
const testimonialRoutes = require("./routes/testimonials");
// Resource Mounting
app.use("/auth", authenticationRoutes(db_config_js_1.default));
app.use("/user", profileRoutes(db_config_js_1.default));
app.use("/testimonial", testimonialRoutes(db_config_js_1.default));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
