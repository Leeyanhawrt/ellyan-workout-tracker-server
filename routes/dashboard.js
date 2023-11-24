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
    router.get("/", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield pool.query('SELECT first_name AS "firstName", last_name AS "lastName" FROM users WHERE id = $1', [req.user]);
            res.json(user.rows[0]);
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Fetching Dashboard");
        }
    }));
    router.post("/update-orm", authorization, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { squatMax, benchMax, deadliftMax } = req.body;
        try {
            const response = yield pool.query("INSERT INTO personal_records (squat_max, bench_max, deadlift_max, id) VALUES ($1, $2, $3, $4) RETURNING *", [squatMax, benchMax, deadliftMax, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
            res.status(201).json("Successfully Entered New Personal Record!");
        }
        catch (err) {
            console.log(err);
            res.status(500).json("Server Error Updating ORM");
        }
    }));
    return router;
};
