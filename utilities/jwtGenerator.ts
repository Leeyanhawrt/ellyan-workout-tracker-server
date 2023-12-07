const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtGenerator = (userId: number) => {
  const payload = {
    user: userId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_KEY, {
    expiresIn: "2hr",
  });
};

module.exports = jwtGenerator;
