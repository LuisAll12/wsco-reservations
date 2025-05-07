import UserModel, { Role, User } from "@/models/user";
import { NextFunction, Request, Response } from "express";

export async function BootManagerMiddleware(req: Request, res: Response, next: NextFunction) {
    const Session = req.cookies;

    if (!Session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.getUserBySessionKey(Session.Session_Key) as User;

    if (user?.Role !== Role.Bootmanager) {
        res.status(403).json({ message: "Forbidden" });
    }

    next();
}
