"use strict";
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtGenerator = (userId) => {
    const payload = {
        user: userId,
    };
    return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_KEY, {
        expiresIn: "24hr",
    });
};
module.exports = jwtGenerator;
