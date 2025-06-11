import UserModel, { User } from "../models/user";
import { NextFunction, Request, Response } from "express";

export async function memberMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const Session = req.cookies.auth_token;

    if (!Session || Session == "") {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await UserModel.getUserBySessionKey(Session) as User;

    (req as any).user = user;

    next();
}