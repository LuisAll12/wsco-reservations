import UserModel from "@/models/user";
import { NextFunction, Request, Response } from "express";

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const Session_Key = req.cookies;

    if (!Session_Key) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await UserModel.getUserBySessionKey(Session_Key.Session_Key);

    if (user?.Role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    next();
}