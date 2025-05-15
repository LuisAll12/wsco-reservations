import * as admin from 'firebase-admin';
import { db } from '../config/db';
import { Boat } from './Boat';
import { User } from './user';
import { Damage } from './Damage';
import { Timestamp } from 'firebase-admin/firestore';
import { ConversationListInstance } from 'twilio/lib/rest/conversations/v1/conversation';

export enum status {
    created = 'created',         // Reservation wurde erstellt
    checkedin = 'checkedin',    // Reservation wurde vor Ort angenommen
    completed = 'completed',     // Reservation durchgeführt + Boot zurückgegeben
    cancelled = 'cancelled'      // Reservation wurde gecancelled
}
export enum PaymentStatus {
    paid = 'paid',
    unpaid = 'unpaid'
}

export interface Reservation {
    // The id of the reservation in the database
    id: string;

    // Reservation details
    startDate: Date;
    endDate: Date;
    status: status;
    NumBlocks: number;
    PaymentStatus: PaymentStatus;
    TotalPrice: number;
    FK_BoatId: admin.firestore.DocumentReference<Boat>;
    FK_UserId: admin.firestore.DocumentReference<User>;
    FK_DamageId?: admin.firestore.DocumentReference<Damage>;

    // Timestamps
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

class ReservationModel {
    private static reservationsRef = db.collection('reservations');

    static async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const reservationData = {
            ...reservation,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const reservationDocRef = await this.reservationsRef.add(reservationData);

        const createdReservationDoc = await reservationDocRef.get();
        const createdReservationData = createdReservationDoc.data();

        if (createdReservationData) {
            return {
                id: reservationDocRef.id,
                ...createdReservationData
            } as Reservation;
        } else {
            throw new Error('Failed to create reservation');
        }
    }

    static async getReservationById(reservationId: string): Promise<Reservation | null> {
        const reservationDoc = await this.reservationsRef.doc(reservationId).get();
        if (reservationDoc.exists) {
            return {
                id: reservationDoc.id,
                ...reservationDoc.data()
            } as Reservation;
        } else {
            return null;
        }
    }

    static async markReservationAsCompleted(reservationId: string): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);

        await reservationDocRef.update({
            status: status.completed,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    static async updateReservation(reservationId: string, updatedData: Partial<Reservation>): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);
        await reservationDocRef.update({
            ...updatedData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    static async deleteReservation(reservationId: string): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);
        await reservationDocRef.delete();
    }

    static async getAllReservations(): Promise<Reservation[]> {
        const snapshot = await this.reservationsRef.get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }

    static async getAllReservationsInRange(startDate: string, endDate: string): Promise<Reservation[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const snapshot = await this.reservationsRef.get();

        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as Reservation;

            const resStart = (data.startDate as unknown as Timestamp).toDate();
            const resEnd = (data.endDate as unknown as Timestamp).toDate();

            if (resStart <= end && resEnd >= start) {
                reservations.push({
                    ...data,
                    id: doc.id,
                    startDate: resStart,
                    endDate: resEnd
                });
            }
        });

        return reservations;
    }


    static async getReservationsByUserId(userId: string): Promise<Reservation[]> {
        const userRef = admin.firestore().doc(`users/${userId}`);
        const snapshot = await this.reservationsRef.where('FK_UserId', '==', userRef).get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        console.log(reservations);

        return reservations;
    }

    static async getReservationsByBoatId(boatId: string): Promise<Reservation[]> {
        const boatRef = admin.firestore().doc(`boats/${boatId}`);
        const snapshot = await this.reservationsRef.where('FK_BoatId', '==', boatRef).get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }


    static async getReservationsByStatus(status: status): Promise<Reservation[]> {
        const snapshot = await this.reservationsRef.where('status', '==', status).get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }

    static async getReservationsByPaymentStatus(paymentStatus: PaymentStatus): Promise<Reservation[]> {
        const snapshot = await this.reservationsRef.where('PaymentStatus', '==', paymentStatus).get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }

    static async getReservationsByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
        const snapshot = await this.reservationsRef
            .where('startDate', '>=', startDate)
            .where('endDate', '<=', endDate)
            .get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }

    static async getReservationsByBoatIdAndDateRange(boatId: string, startDate: Date, endDate: Date): Promise<Reservation[]> {
        const snapshot = await this.reservationsRef
            .where('FK_BoatId', '==', boatId)
            .where('startDate', '>=', startDate)
            .where('endDate', '<=', endDate)
            .get();
        const reservations: Reservation[] = [];

        snapshot.forEach((doc) => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            } as Reservation);
        });

        return reservations;
    }

    static async markReservationAsPaid(reservationId: string): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);
        await reservationDocRef.update({
            PaymentStatus: PaymentStatus.paid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    static async markReservationAsConfirmed(reservationId: string, time: string): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);
        const reservationDoc = await reservationDocRef.get();

        if (!reservationDoc.exists) {
            throw new Error('Reservation not found');
        }

        const reservationData = reservationDoc.data() as Reservation;
        const reservationStartTime = (reservationData.startDate as unknown as Timestamp).toDate();

        if (reservationStartTime.getTime() - new Date(time).getTime() <= 60 * 60 * 1000) {
            await reservationDocRef.update({
                status: status.checkedin,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            throw new Error('Reservation can only be confirmed one hour or less before the start time');
        }
    }

    static async markReservationAsCancelled(reservationId: string): Promise<void> {
        const reservationDocRef = this.reservationsRef.doc(reservationId);
        await reservationDocRef.update({
            status: status.cancelled,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
}

export default ReservationModel;