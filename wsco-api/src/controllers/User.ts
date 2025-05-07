import UserModel, { State, User, Role } from "@/models/user";

import { sendVerificationEmail } from "@/services/mail";
import { generateKey, randomInt } from "crypto";
import { Request, RequestHandler, Response } from "express";
import { AwsInstance } from "twilio/lib/rest/accounts/v1/credential/aws";

export const CreateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, _Role } = req.body;

    if (!firstName || !lastName || !email) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    try {
        const user: Omit<User, 'id' | 'name' | 'createdAt' | 'updatedAt'> = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            State: State.Active,
            Role: _Role || Role.Member,
            Reservation: [],
            Session_Key: "",
            DamageReport: [],
        }
        // Assuming you have a UserModel to handle user creation
        const newUser = await UserModel.createUser(user);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
}

export const AuthenticateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }

    try {
        const user = await UserModel.getUserByEmail(email);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const code = randomInt(100000, 999999).toString();

        UserModel.storeAuthCode(user.email, code);

        try {
            await sendVerificationEmail(user.email, user.firstName, code);
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ message: "Error sending verification email", error });
            return;
        }
        res.status(200).json({ message: "success" });
    } catch (error) {
        console.error("Auth error:", error);
        res.status(500).json({ message: "Error during authentication", error });
    }
};


export const FinishAuth: RequestHandler = async (req, res) => {
    const { code, email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Code and email are required" });
        return;
    }

    try {
        const user = await UserModel.getUserByEmail(email) as User;

        if (!await UserModel.verifyAuthCode(user.email, code)) {
            res.status(401).json({ message: "Invalid code" });
            return;
        }

        await UserModel.generateSessionKey(user.id);
        const sessionKey = await UserModel.getSessionKey(user.id);

        res.cookie("session_key", sessionKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).json({ message: "Authentication failed", error });
    }
};

export const GetUserSession: RequestHandler = async (req, res) => {
    const sessionKey = req.cookies.session_key;

    if (!sessionKey) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user = await UserModel.getUserBySessionKey(sessionKey);

        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user session", error });
    }
};

export const LogoutUser: RequestHandler = async (req, res) => {
    const sessionKey = req.cookies.session_key;

    if (!sessionKey) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const user = await UserModel.getUserBySessionKey(sessionKey) as User;
        await UserModel.clearUserSessionKey(user.id);
        res.clearCookie("session_key");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error });
    }
};
