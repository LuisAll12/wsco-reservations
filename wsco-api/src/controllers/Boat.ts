import BoatModel, { Boat, BoatStatus } from "@/models/Boat";
import ReservationModel, { Reservation } from "@/models/Reservation";

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
            imgUrl,
            status = BoatStatus.available
        } = req.body;

        const newBoat: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'> = {
            name,
            pdfUrl,
            imgUrl,
            description,
            numberplate,
            pricePerBlock,
            Type,
            status,
            FK_ReservationId: []
        };

        const createdBoat = await BoatModel.createBoat(newBoat);
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

