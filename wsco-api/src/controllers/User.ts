import UserModel, { State, User, Role } from "@/models/user";
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