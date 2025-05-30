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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const db_1 = require("./db");
const config_1 = require("./config");
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signUpSchema = zod_1.z.object({
        name: zod_1.z.string(),
        username: zod_1.z.string(),
        password: zod_1.z.string()
            .min(8, { message: "Minimum 8 characters" })
            .max(32, { message: "Maximum 32 characters" })
    });
    const signUpData = signUpSchema.safeParse(req.body);
    if (!signUpData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: signUpData.error
        });
    }
    const { name, username, password } = signUpData.data;
    try {
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (existingUser) {
            return res.status(403).json({
                message: "User already exists. Please Login"
            });
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield db_1.UserModel.create({ name, username, password: hashPassword });
        res.status(200).json({
            message: "Signed up successfully",
            user: newUser
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Something went Wrong: ", error.message);
        }
        res.status(500).json({
            message: "Internal server error",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signInSchema = zod_1.z.object({
        username: zod_1.z.string(),
        password: zod_1.z.string()
            .min(8, { message: "Minimum 8 characters" })
            .max(32, { message: "Maximum 32 characters" })
    });
    const signInData = signInSchema.safeParse(req.body);
    if (!signInData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: signInData.error
        });
    }
    const { username, password } = signInData.data;
    try {
        const signedUser = yield db_1.UserModel.findOne({ username });
        if (!signedUser) {
            return res.status(403).json({
                message: "Incorrect username"
            });
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, signedUser.password);
        if (!passwordMatch) {
            return res.status(403).json({
                message: "Incorrect password"
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: signedUser._id.toString() }, config_1.JWT_USER_PASSWORD);
        res.status(200).json({
            message: "Signed In successfully",
            token: token
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Something went wrong: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
}));
// app.post("/api/v1/content", (req, res) => {
// });
// app.get("/api/v1/content", (req, res) => {
// });
// app.delete("/api/v1/content", (req, res) => {
// });
// app.post("/api/v1/brain/share", (req, res) => {
// });
// app.get("/api/v1/brain/:shareLink", (req, res) => {
// });
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGODB_URL || "");
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    });
}
main();
