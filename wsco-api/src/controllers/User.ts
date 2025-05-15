import UserModel, { State, User, Role } from "../models/user";
import { sendVerificationEmail } from "../services/mail";
import { randomInt } from "crypto";
import { Request, RequestHandler, Response } from "express";


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

        res.cookie("auth_token", sessionKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none"
        });


        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).json({ message: "Authentication failed", error });
    }
};

export const GetUserSession: RequestHandler = async (req, res) => {
    const sessionKey = req.cookies.auth_token;

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
    const sessionKey = req.cookies.auth_token;

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

export const GetAllUsers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

export const RoleChange: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { role } = req.query as { role: Role };

        if (!id || !role) {
            res.status(400).json({ error: "ID und neue Rolle sind erforderlich." });
            return;
        }

        await UserModel.updateUser(id, { Role: role });

        res.status(200).json({ message: "success" });
        return;
    } catch (e) {
        console.error(e)
        res.status(403).json({ error: e });
        return;
    }
}

export const GetRole: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const session = req.cookies.auth_token;

        const user = await UserModel.getUserBySessionKey(session);

        res.status(200).json({ message: "success", role: user.Role });
        return;

    } catch (e: unknown) {
        e as Error;
        console.error(e);
        res.status(402).json({ message: "error", error: e });
        return;
    }
}