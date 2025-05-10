import BoatModel, { Boat, BoatStatus } from "@/models/Boat";
import { uploadFile } from "@/services/S3";

import { Request, Response, RequestHandler } from 'express';

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
            pdfUrl,
            status = BoatStatus.available
        } = req.body;

        let imageUrl: string = "";
        
        if (req.file) {
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
        }

        const newBoat: Partial<Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>> = {
            name,
            pdfUrl: pdfUrl || '', // optional: leerer String oder weglassen
            imgUrl: imageUrl,
            description,
            numberplate,
            pricePerBlock,
            Type,
            status,
            FK_ReservationId: []
        };

            // Entferne alle undefined-Werte (z. B. pdfUrl)
        Object.keys(newBoat).forEach(key => {
            if (newBoat[key as keyof typeof newBoat] === undefined) {
                delete newBoat[key as keyof typeof newBoat];
            }
        });

        const createdBoat = await BoatModel.createBoat(newBoat as Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>);

        res.status(201).json(createdBoat);
    } catch (error) {
        console.error("Error creating boat:", error);
        res.status(500).json({ error: "Error creating boat" });
    }
};


export const getBoatById = async (req: Request, res: Response): Promise<void> => {
    const boatId = req.params.id;
    const boat = await BoatModel.getBoatById(boatId);
    if (!boat) { res.status(404).json({ error: 'Not found' }); return; };
    res.status(200).json(boat);
};
