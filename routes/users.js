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
            const { gender, weight } = req.body;
            const data = yield pool.query(`UPDATE users SET gender = $1, bodyweight = $2 WHERE id = $3;`, [gender, weight, req.user]);
            res.status(200).send(data.rows);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Adding Profile Information");
        }
    }));
    return router;
};
