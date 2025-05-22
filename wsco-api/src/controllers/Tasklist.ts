import { admin } from "@/config/db";
import BoatModel from "@/models/Boat";
import ChecklistModel, { Checklist } from "@/models/Checklist";
import { Request, RequestHandler, Response } from "express";

export const createChecklist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { boatId, tasks, description, name } = req.body as { boatId: string; tasks: string[], description: string; name: string };

    try {
        const cleanedTasks = (tasks || []).filter((task): task is string => typeof task === 'string' && task.trim() !== '');

        const checklist = await ChecklistModel.createChecklist({
            items: cleanedTasks,
            description: `${description}`,
            name: `${name}`,
        });

        const boat = await BoatModel.getBoatById(boatId);
        if (!boat) {
            res.status(404).json({ message: "Boat not found" });
            return;
        }

        boat.FK_checklist_id = admin.firestore().doc(`checklists/${checklist.id}`) as admin.firestore.DocumentReference<Checklist>;
        await BoatModel.updateBoat(boatId, boat);

        res.status(201).json(checklist);
    } catch (error: any) {
        console.error("Error creating checklist:", error);
        res.status(500).json({ message: "Error creating checklist", error: error.message });
    }
} 