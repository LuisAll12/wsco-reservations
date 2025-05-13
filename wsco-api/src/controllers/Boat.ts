import BoatModel, { Boat, BoatStatus } from "../models/Boat";
import { uploadFile } from "../services/S3";
import ReservationModel, { Reservation } from "../models/Reservation";
import { Request, Response, RequestHandler } from 'express';
import { Timestamp } from "firebase-admin/firestore";

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

        if ((req as any).file) {
            imageUrl = await uploadFile(
                (req as any).file.buffer,
                (req as any).file.originalname,
                (req as any).file.mimetype
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


export const deleteBoat = async (req: Request, res: Response): Promise<void> => {
    try {
        const boatId = req.params.id;
        const deleted = await BoatModel.deleteBoat(boatId);
        if (!deleted) {
            res.status(404).json({ error: 'Boot nicht gefunden' });
            return;
        }
        res.status(200).json({ message: 'Boot erfolgreich gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen des Bootes:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
};
export const isBoatOccupied = async (req: Request, res: Response): Promise<void> => {
    const { boatId, startCheckTime, endCheckTime } = req.query as {
        boatId: string,
        startCheckTime: string,
        endCheckTime: string
    };

    const start = new Date(startCheckTime).getTime() / 1000;
    const end = new Date(endCheckTime).getTime() / 1000;

    const boatReservations = await ReservationModel.getReservationsByBoatId(boatId) as Reservation[];

    for (const reservation of boatReservations) {
        const eStart = (reservation.startDate as unknown as Timestamp).toDate().getTime() / 1000;
        const eEnd = (reservation.endDate as unknown as Timestamp).toDate().getTime() / 1000;

        console.log('Requested:', { start, end });
        console.log('Reservation:', { eStart, eEnd });

        console.log('Overlap check:', start > eEnd, end < eStart);
        if (start < eEnd && end > eStart) {
            res.status(200).json({ isOccupied: true });
            return;
        }
    }

    res.status(200).json({ isOccupied: false });
};

