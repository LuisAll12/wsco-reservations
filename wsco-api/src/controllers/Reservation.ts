import ReservationModel, { Reservation, PaymentStatus, status } from '../models/Reservation';
import { db } from '@/config/db';
import BoatModel, { Boat } from '@/models/Boat';
import UserModel, { User } from '@/models/user';
import { DocumentReference } from 'firebase-admin/firestore';
import { Request, Response, RequestHandler } from 'express';

export const createReservation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, FK_BoatId } = req.body;
    const FK_UserId = (req as any).user?.id;

    if (!startDate || !endDate || !FK_BoatId || !FK_UserId) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    try {
        // Fetch and validate boat
        const boat = await BoatModel.getBoatById(FK_BoatId);
        if (!boat) {
            res.status(404).json({ message: "Boat not found" });
            return;
        }

        // Fetch and validate user
        const user = await UserModel.getUserById(FK_UserId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Construct reservation data
        const reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            FK_BoatId: db.collection('boats').doc(boat.id) as DocumentReference<Boat>,
            FK_UserId: db.collection('users').doc(user.id) as DocumentReference<User>,
            PaymentStatus: PaymentStatus.unpaid,
            status: status.pending,
            NumBlocks: 0,
            TotalPrice: 0,
        };

        // Create reservation
        const newReservation = await ReservationModel.createReservation(reservationData);

        res.status(201).json(newReservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: "Error creating reservation", error: error instanceof Error ? error.message : error });
    }
};

export const getAllReservations: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query as { startDate: string, endDate: string };

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ message: "Invalid date format" });
        return;
    }

    const Reservations = await ReservationModel.getAllReservationsInRange(start, end) as Reservation[];

    if (!Reservations) {
        res.status(200).json({ message: "No reservations found" });
        return;
    }

    res.status(200).json(Reservations);
}
