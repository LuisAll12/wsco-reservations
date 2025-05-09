import { admin } from "@/config/db";
import { Boat } from "@/models/Boat";
import ReservationModel, { PaymentStatus, Reservation, status } from "@/models/Reservation";
import { Request, RequestHandler, Response } from "express";

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

export const createReservation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate, boatId } = req.body as { startDate: string, endDate: string, boatId: admin.firestore.DocumentReference<Boat> };
    const userId = (req as any).user?.id;

    if (!startDate || !endDate || !boatId) {
        res.status(400).json({ message: "Start date, end date and boatId are required" });
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ message: "Invalid date format" });
        return;
    }

    const reservationObj: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'> = {
        startDate: start,
        endDate: end,
        status: status.pending,
        NumBlocks: 0,
        PaymentStatus: PaymentStatus.unpaid,
        TotalPrice: 0,
        FK_BoatId: boatId,
        FK_UserId: userId,

    }

    await ReservationModel.createReservation(reservationObj);

    res.status(201).json({ message: "success" });
}