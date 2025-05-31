"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(404).json({
            message: "Token not found"
        });
    }
    try {
        const decodedData = jsonwebtoken_1.default.verify(token, config_1.JWT_USER_PASSWORD);
        if (!decodedData) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        else {
            //@ts-ignore
            req.userId = decodedData.id;
            next();
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("JWT error: ", error.message);
        }
        res.status(500).send({
            message: "Token invalid or expired",
        });
    }
};
exports.userMiddleware = userMiddleware;
