import ReservationModel, { Reservation, PaymentStatus, status } from '../models/Reservation';
import { db } from '../config/db';
import BoatModel, { Boat } from '../models/Boat';
import UserModel, { User } from '../models/user';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { Request, Response, RequestHandler } from 'express';

export const createReservation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, FK_BoatId } = req.body;
    const sessionKey = req.cookies.auth_token;

    const user = await UserModel.getUserBySessionKey(sessionKey) as User;
    const FK_UserId = user.id;


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
            isChecklistCompleted: false,
            ReadyToCheckin: false,
            PaymentStatus: PaymentStatus.unpaid,
            status: status.created,
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
    const { start, end, boatId = null } = req.query as { start: string, end: string, boatId: string | null };

    const startDate = new Date(start).toISOString();
    const endDate = new Date(end).toISOString();

    if (!startDate || !endDate) {
        res.status(400).json({ message: "Start and end dates are required" });
        return;
    }

    const Reservations = await ReservationModel.getAllReservationsInRange(startDate, endDate) as Reservation[];

    if (boatId) {
        const filteredReservations = Reservations.filter(reservation => reservation.FK_BoatId.id === boatId);
        if (filteredReservations.length > 0) {
            res.status(200).json(filteredReservations);
            return;
        } else {
            res.status(200).json({ message: "No reservations found for this boat" });
            return;
        }
    }

    if (!Reservations) {
        res.status(200).json({ message: "No reservations found" });
        return;
    }

    res.status(200).json(Reservations);
}

export const getUsersReservations: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const sessionKey = req.cookies.auth_token;

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

        // Fetch boot data for each reservation
        const reservationsWithBoat = await Promise.all(reservations.map(async (reservation) => {
            reservation.startDate = (reservation.startDate as unknown as Timestamp).toDate();
            reservation.endDate = (reservation.endDate as unknown as Timestamp).toDate();

            let boatData = null;
            try {
                boatData = { id: (await reservation.FK_BoatId.get()).id };
            } catch (error) {
                console.error(`Fehler beim Laden des Boots für Reservation ${reservation.id}:`, error);
            }

            return {
                ...reservation,
                boat: boatData,
            };
        }));

        res.status(200).json(reservationsWithBoat);
    } catch (error) {
        console.error("Error fetching user's reservations:", error);
        res.status(500).json({ message: "Error fetching user's reservations", error: error instanceof Error ? error.message : error });
    }
}

export const MarkReservationAsCheckedin = async (req: Request, res: Response): Promise<void> => {
    const { ReservationId } = req.body as { ReservationId: string };

    try {
        await ReservationModel.markReservationAsConfirmed(ReservationId, new Date().toISOString());
        res.status(200).json({ message: "success" });
    } catch (error: any) {
        res.status(409).json({ error: error.message });
        return;
    }
}

export const setReservationAsCancelled = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
        await ReservationModel.markReservationAsCancelled(id);
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(409).json({ error: error });
        return;
    }
}

export const getReservationsTasklist = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    try {
        const reservation = await ReservationModel.getReservationById(id);
        if (!reservation) {
            res.status(404).json({ message: "Reservation not found" });
            return;
        }

        // Check and get boat reference
        const boatRef = reservation.FK_BoatId;
        if (!boatRef || typeof boatRef.get !== 'function') {
            res.status(400).json({ message: "Invalid or missing FK_BoatId" });
            return;
        }

        const boatDoc = await boatRef.get();
        if (!boatDoc.exists) {
            res.status(404).json({ message: "Boat not found" });
            return;
        }

        const boat = boatDoc.data();
        const checklistRef = boat?.FK_checklist_id;

        if (!checklistRef) {
            res.status(400).json({ message: "Missing FK_checklist_id in boat document" });
            return;
        }

        if (typeof checklistRef.get !== 'function') {
            console.error("Expected FK_checklist_id to be a DocumentReference, but got:", checklistRef);
            res.status(400).json({ message: "FK_checklist_id is not a valid Firestore DocumentReference" });
            return;
        }

        const checklistDoc = await checklistRef.get();

        if (!checklistDoc.exists) {
            res.status(404).json({ message: "Checklist not found" });
            return;
        }

        const data = checklistDoc.data();

        res.status(200).json({ checklist: data, reservation: reservation });
    } catch (error: any) {
        console.error("Error in getReservationsTasklist:", error);
        res.status(409).json({ error: error.message });
    }
}

