import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors"

import { z } from "zod";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_USER_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { hashGenerator } from "./utils";

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
    const signUpSchema = z.object({
        name: z.string(),
        username: z.string(),
        password: z.string()
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
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(403).json({
                message: "User already exists. Please Login"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({ name, username, password: hashPassword });

        res.status(200).json({
            message: "Signed up successfully",
            user: newUser
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Signup error: ", error.message);
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
    if (!signInData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: signInData.error
        });
    }

    const { username, password } = signInData.data;

    try {
        const signedUser = await UserModel.findOne({ username });
        if (!signedUser) {
            return res.status(403).json({
                message: "Incorrect username"
            });
        }

        const passwordMatch = await bcrypt.compare(password, signedUser.password);
        if (!passwordMatch) {
            return res.status(403).json({
                message: "Incorrect password"
            });
        }

        const token = jwt.sign({ id: signedUser._id.toString() }, JWT_USER_PASSWORD);

        res.status(200).json({
            message: "Signed In successfully",
            token: token
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Signin error: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const contentBody = z.object({
        link: z.string(),
        type: z.enum(["document", "tweet", "youtube", "link"]),
        title: z.string().min(1, { message: "Title cannot be empty" })
    });

    const contentData = contentBody.safeParse(req.body);
    if (!contentData.success) {
        return res.status(411).send({
            message: "Invalid format",
            error: contentData.error
        });
    }

    const { link, type, title } = contentData.data;

    try {
        const content = await ContentModel.create({
            link,
            type,
            title,
            //@ts-ignore
            userId: req.userId,
            tags: []
        });
        
        res.status(200).json({
            message: "Content addded successfully",
            Content: content
        });
    } catch(error: unknown) {
        if(error instanceof Error) {
            console.error("Content addition error: ", error.message);
            res.status(500).json({
                message: "Internal Server erorr"
            });
        }
    }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    try {
        const contents = await ContentModel.find({ userId }).populate("userId", "username");

        res.status(200).json({
            message: "Contents displayed successfully",
            Contents : contents
        });
    } catch(error: unknown) {
        if(error instanceof Error) {
            console.error("Content display error: ", error.message);
        }
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.delete("/api/v1/content/:contentId", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const contentId = req.params.contentId;

    try {
        const deleteContent = await ContentModel.findOneAndDelete({
            _id: contentId,
            userId
        });

        if(!deleteContent) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        res.status(200).json({
            message: "Content deleted successfully",
            Content: deleteContent
        });
    } catch(error) {
        if(error instanceof Error) {
            console.log("Content delete error: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const share = req.body.share;

    try {
        if(share) {
            const existingLink = await LinkModel.findOne({ userId });
            if(existingLink) {
                return res.status(200).json({
                    link: existingLink.hash,
                    message: "Shareable link already exists"
                });
            }

            const hash = hashGenerator(15);
            const newLink = await LinkModel.create({ userId, hash });

            return res.status(200).json({
                link: newLink.hash,
                message: "Shareable link created"
            });
        } else {
            await LinkModel.deleteOne({ userId });
            return res.status(200).json({
                message: "Shareable link removed"
            });
        }
    } catch(error) {
        if(error instanceof Error) {
            console.log("Shareable link generate error: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    try {
        const link = await LinkModel.findOne({ hash });
        if(!link) {
            return res.status(400).json({
                message: "Expired or Invalid link"
            });
        }

        const user = await UserModel.findOne({
            _id: link.userId
        });
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const contents = await ContentModel.find({
            userId: link.userId
        });

        res.status(200).json({
            message: "Contents fetched successfully",
            username: user.username,
            contents: contents
        })

    } catch(error) {
        if(error instanceof Error) {
            console.log("Content share error: ", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }
});

async function main() {
    await mongoose.connect(process.env.MONGODB_URL || "");
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

main();