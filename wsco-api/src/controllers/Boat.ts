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


export const createBoat: RequestHandler = async (req, res) => {
    try {
        const {
            name,
            description,
            numberplate,
            pricePerBlock,
            Type, 
            status = BoatStatus.available
        } = req.body;

        const newBoat: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'> = {
            name,
            description,
            numberplate,
            pricePerBlock,
            Type,
            status,
            FK_ReservationId: [] // 👈 muss gesetzt werden
        };

        const createdBoat = await BoatModel.createBoat(newBoat);
        res.status(201).json(createdBoat);
    } catch (error) {
        console.error("Error creating boat:", error);
        res.status(500).json({ error: "Error creating boat" });
    }
};

