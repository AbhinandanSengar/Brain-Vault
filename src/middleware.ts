import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_USER_PASSWORD } from "./config";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(404).json({
            message: "Token not found"
        });
    } 

    try {
        const decodedData = jwt.verify(token as string, JWT_USER_PASSWORD);
        if(!decodedData) {
            return res.status(404).json({
                message: "User not found"
            });
        } else {
            //@ts-ignore
            req.userId = decodedData.id;
            next();
        }
    } catch(error) {
        if(error instanceof Error) {
            console.error("JWT error: ", error.message);
        }
        res.status(500).send({
            message: "Token invalid or expired",
        });
    }
}