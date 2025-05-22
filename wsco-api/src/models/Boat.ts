import * as admin from 'firebase-admin';
import { db } from '../config/db';
import { Reservation } from './Reservation';
import { Checklist } from './Checklist';

export enum BoatStatus {
    available = 'available',
    unavailable = 'unavailable'
}

export interface Boat {
    // The id of the boat in the database
    id: string;

    // Boat details
    name: string;
    description: string;
    numberplate: string;
    pricePerBlock: number;
    imgUrl: string;
    pdfUrl: string;
    Type: string;
    status: BoatStatus;
    FK_ReservationId: admin.firestore.DocumentReference<Reservation>[];
    FK_checklist_id: admin.firestore.DocumentReference<Checklist>;

    // Timestamps
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

class BoatModel {
    private static boatsRef = db.collection('boats');

    static async createBoat(boat: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Boat> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const boatData = {
            ...boat,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const boatDocRef = await this.boatsRef.add(boatData);

        const createdBoatDoc = await boatDocRef.get();
        const createdBoatData = createdBoatDoc.data();

        if (createdBoatData) {
            return {
                id: boatDocRef.id,
                ...createdBoatData
            } as Boat;
        } else {
            throw new Error('Failed to create boat');
        }
    }

    static async getBoatById(boatId: string): Promise<Boat | null> {
        const boatDoc = await this.boatsRef.doc(boatId).get();
        if (boatDoc.exists) {
            return { id: boatDoc.id, ...boatDoc.data() } as Boat;
        } else {
            return null;
        }
    }

    static async getAllBoats(): Promise<Boat[]> {
        const snapshot = await this.boatsRef.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Boat));
    }

    static async updateBoat(boatId: string, updatedData: Partial<Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Boat | null> {
        const boatDocRef = this.boatsRef.doc(boatId);
        await boatDocRef.update({
            ...updatedData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedBoatDoc = await boatDocRef.get();
        if (updatedBoatDoc.exists) {
            return { id: updatedBoatDoc.id, ...updatedBoatDoc.data() } as Boat;
        } else {
            return null;
        }
    }

    static async deleteBoat(boatId: string): Promise<boolean> {
        const boatDocRef = this.boatsRef.doc(boatId);
        const doc = await boatDocRef.get();

        if (!doc.exists) {
            return false;
        }

        await boatDocRef.delete();
        return true;
    }

    static async addReservationToBoat(boatId: string, reservationId: string): Promise<void> {
        const boatDocRef = this.boatsRef.doc(boatId);
        await boatDocRef.update({
            FK_ReservationId: admin.firestore.FieldValue.arrayUnion(reservationId)
        });
    }

    static async removeReservationFromBoat(boatId: string, reservationId: string): Promise<void> {
        const boatDocRef = this.boatsRef.doc(boatId);
        await boatDocRef.update({
            FK_ReservationId: admin.firestore.FieldValue.arrayRemove(reservationId)
        });
    }
}

export default BoatModel;