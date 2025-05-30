import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { z } from "zod";
import { UserModel } from "./db";
import { JWT_USER_PASSWORD } from "./config";

const PORT = 3000;

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    const signUpSchema = z.object({
        name: z.string(),
        username: z.string(),
        password: z.string()
            .min(8, { message: "Minimum 8 characters" })
            .max(32, { message: "Maximum 32 characters" })
    });

    const signUpData = signUpSchema.safeParse(req.body);
    if(!signUpData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: signUpData.error
        });
    }

    const { name, username, password } = signUpData.data;

    try {
        const existingUser = await UserModel.findOne({ username });
        if(existingUser) {
            return res.status(403).json({
                message: "User already exists. Please Login"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({ name, username, password: hashPassword});

        res.status(200).json({
            message: "Signed up successfully",
            user: newUser
        });
    } catch(error: unknown) {
        if(error instanceof Error){
            console.error("Something went Wrong: ", error.message);
        }
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.post("/api/v1/signin", async (req, res) => {
    const signInSchema = z.object({
        username: z.string(),
        password: z.string()
            .min(8, { message: "Minimum 8 characters" })
            .max(32, { message: "Maximum 32 characters" })
    });

    const signInData = signInSchema.safeParse(req.body);
    if(!signInData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: signInData.error
        });
    }

    const { username, password } = signInData.data; 

    try {
        const signedUser = await UserModel.findOne({ username });
        if(!signedUser) {
            return res.status(403).json({
                message: "Incorrect username"
            });
        }

        const passwordMatch = await bcrypt.compare(password, signedUser.password);
        if(!passwordMatch) {
            return res.status(403).json({
                message: "Incorrect password"
            });
        }

        const token = jwt.sign({ id: signedUser._id.toString() }, JWT_USER_PASSWORD);

        res.status(200).json({
            message: "Signed In successfully",
            token: token
        });
    } catch(error: unknown) {
        if(error instanceof Error) {
            console.log("Something went wrong: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

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

async function main() {
    await mongoose.connect(process.env.MONGODB_URL || "");
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

main();