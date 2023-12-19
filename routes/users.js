"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authorization = require("../middleware/authorization");
module.exports = (pool) => {
    /* GET all users */
    router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield pool.query(`SELECT * FROM users`);
            res.status(200).send(data.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error");
        }
    }));
    router.post("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, gender, bodyweight, roundDown } = req.body;
            const requiredFields = [firstName, lastName, email];
            const valid = requiredFields.every((field) => Boolean(field));
            if (!valid) {
                return res.status(400).json({ error: "Missing Required Fields" });
            }
            const data = yield pool.query(`UPDATE users SET first_name = $1, last_name = $2, email = $3, gender = $4, bodyweight = $5, roundDown = $6 WHERE id = $7;`, [
                firstName,
                lastName,
                email.toLowerCase(),
                gender,
                bodyweight,
                roundDown,
                req.user,
            ]);
            res
                .status(200)
                .json({ message: "Successfully Updated Profile Information!" });
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Adding Profile Information");
        }
    }));
    return router;
};
