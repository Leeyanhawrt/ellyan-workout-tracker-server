"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cors = require("cors");
const configureCors = (app) => {
    if (process.env.NODE_ENV === "development") {
        app.use(cors({ origin: "http://localhost:5173" }));
    }
    app.use(cors({ origin: "https://ellyan.netlify.app" }));
};
exports.default = configureCors;
