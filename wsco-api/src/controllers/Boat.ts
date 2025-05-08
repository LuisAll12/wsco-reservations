import BoatModel, {Boat, BoatStatus} from "@/models/Boat";
import { db } from '@/config/db';

import { Request, Response, RequestHandler } from 'express';
import { constrainedMemory } from 'process';

export const getAllBoats: RequestHandler = async (req, res) => {
    try {
        const boats: Boat[] = await BoatModel.getAllBoats();
        res.status(200).json(boats);
    } catch (error) {
        console.error("Error fetching boats:", error);
        res.status(500).json({ error: "Error fetching boats" });
    }
};
