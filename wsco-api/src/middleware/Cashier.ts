import UserModel, { Role, User } from "../models/user";
import { NextFunction, Request, Response } from "express";

export async function CashierMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const Session = req.cookies.auth_token;

    if (!Session) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await UserModel.getUserBySessionKey(Session) as User;

    if (user.Role === Role.Cashier || user.Role === Role.Admin) {
        (req as any).user = user;

        next();
    } else {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
}