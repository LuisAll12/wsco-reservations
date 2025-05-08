import ReservationModel, { Reservation, PaymentStatus, status } from '../models/Reservation';
import BoatModel from '@/models/Boat';

import { db } from '@/config/db';

import { Request, Response, RequestHandler } from 'express';
import { constrainedMemory } from 'process';

export const createReservation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, FK_BoatId, FK_UserId } = req.body;

    if (!startDate || !endDate || !FK_BoatId || !FK_UserId) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    try {
        const boatRef = db.collection('boats').doc(FK_BoatId);
        const userRef = db.collection('users').doc(FK_UserId);

        const boatDoc = await boatRef.get();
        if (!boatDoc.exists) {
            res.status(404).json({ message: "Boat not found" });
            return;
        }

        const reservationData = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            FK_BoatId: boatRef,
            FK_UserId: userRef,
            PaymentStatus: PaymentStatus.unpaid,
            status: status.pending,
            NumBlocks: 0,
            TotalPrice: 0,
        } as Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>;

        const newReservation = await ReservationModel.createReservation(reservationData);
        res.status(201).json(newReservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Error creating reservation", error });
    }
};

