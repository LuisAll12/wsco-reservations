import ReservationModel, { Reservation, PaymentStatus, status } from '../models/Reservation';
import { db } from '@/config/db';
import BoatModel, { Boat } from '@/models/Boat';
import UserModel, { User } from '@/models/user';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { Request, Response, RequestHandler } from 'express';

export const createReservation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, FK_BoatId, FK_UserId } = req.body;


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

        const user = await UserModel.getUserById(FK_UserId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            FK_BoatId: db.collection('boats').doc(FK_BoatId) as DocumentReference<Boat>,
            FK_UserId: db.collection('users').doc(FK_UserId) as DocumentReference<User>,
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
    const { start, end } = req.query as { start: string, end: string };

    const startDate = new Date(start).toISOString();
    const endDate = new Date(end).toISOString();

    const Reservations = await ReservationModel.getAllReservationsInRange(startDate, endDate) as Reservation[];

    if (!Reservations) {
        res.status(200).json({ message: "No reservations found" });
        return;
    }

    res.status(200).json(Reservations);
}

export const getUsersReservations: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const sessionKey = req.cookies.session_key;

    const user = await UserModel.getUserBySessionKey(sessionKey) as User;

    if (!user.id) {
        res.status(400).json({ message: "No User found" });
        return;
    }

    try {
        const reservations = await ReservationModel.getReservationsByUserId(user.id);

        if (!reservations) {
            res.status(200).json({ message: "No reservations found for this user" });
            return;
        }

        reservations.forEach((reservation) => {
            reservation.startDate = (reservation.startDate as unknown as Timestamp).toDate();
            reservation.endDate = (reservation.endDate as unknown as Timestamp).toDate();
        })

        res.status(200).json(reservations)
    } catch (error) {
        console.error("Error fetching user's reservations:", error);
        res.status(500).json({ message: "Error fetching user's reservations", error: error instanceof Error ? error.message : error });
    }
}
