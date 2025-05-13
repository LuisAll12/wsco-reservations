import * as admin from 'firebase-admin';
import { Reservation } from './Reservation';
import { User } from './user';
import { db } from '../config/db';

export enum DamageStatus {
    IN_PROGRESS = 'inProgress',
    COMPLETED = 'completed',
    PENDING = 'pending'
}

export interface Damage {
    id: string;
    damageType: string;
    damageReason: string;
    damageStatus: DamageStatus;
    damageDescription: string;
    FixedDate: Date;
    FixedBy?: admin.firestore.DocumentReference<User>;
    FK_Reservation: admin.firestore.DocumentReference<Reservation>;

    pictureUrls?: string[];

    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

class DamageModel {
    private static damageRef = db.collection('damages');

    static async createDamage(damage: Omit<Damage, 'id' | 'createdAt' | 'updatedAt'>): Promise<Damage> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const damageData = {
            ...damage,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const damageDocRef = await this.damageRef.add(damageData);

        const createdDamageDoc = await damageDocRef.get();
        const createdDamageData = createdDamageDoc.data();

        if (createdDamageData) {
            return {
                id: damageDocRef.id,
                ...createdDamageData
            } as Damage;
        } else {
            throw new Error('Failed to create damage');
        }
    }

    static async getDamageById(id: string): Promise<Damage | null> {
        const damageDoc = await this.damageRef.doc(id).get();
        if (damageDoc.exists) {
            return {
                id: damageDoc.id,
                ...damageDoc.data()
            } as Damage;
        } else {
            return null;
        }
    }

    static async updateDamage(id: string, damage: Partial<Damage>): Promise<Damage | null> {
        const damageDocRef = this.damageRef.doc(id);
        await damageDocRef.update({
            ...damage,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedDamageDoc = await damageDocRef.get();
        if (updatedDamageDoc.exists) {
            return {
                id: updatedDamageDoc.id,
                ...updatedDamageDoc.data()
            } as Damage;
        } else {
            return null;
        }
    }

    static async deleteDamage(id: string): Promise<void> {
        const damageDocRef = this.damageRef.doc(id);
        await damageDocRef.delete();
    }

    static async getAllDamages(): Promise<Damage[]> {
        const snapshot = await this.damageRef.get();
        const damages: Damage[] = [];

        snapshot.forEach((doc) => {
            damages.push({
                id: doc.id,
                ...doc.data()
            } as Damage);
        });

        return damages;
    }

    static async getDamagesByReservationId(reservationId: string): Promise<Damage[]> {
        const snapshot = await this.damageRef.where('FK_Reservation', '==', db.collection('reservations').doc(reservationId)).get();
        const damages: Damage[] = [];

        snapshot.forEach((doc) => {
            damages.push({
                id: doc.id,
                ...doc.data()
            } as Damage);
        });

        return damages;
    }

    static async markDamageAsFixed(damageId: string, fixedBy: admin.firestore.DocumentReference<User>, fixedDate: Date): Promise<Damage | null> {
        const damageDocRef = this.damageRef.doc(damageId);
        await damageDocRef.update({
            damageStatus: DamageStatus.COMPLETED,
            FixedBy: fixedBy,
            FixedDate: fixedDate,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedDamageDoc = await damageDocRef.get();
        if (updatedDamageDoc.exists) {
            return {
                id: updatedDamageDoc.id,
                ...updatedDamageDoc.data()
            } as Damage;
        } else {
            return null;
        }
    }

    static async markDamageAsInProgress(damageId: string): Promise<Damage | null> {
        const damageDocRef = this.damageRef.doc(damageId);
        await damageDocRef.update({
            damageStatus: DamageStatus.IN_PROGRESS,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedDamageDoc = await damageDocRef.get();
        if (updatedDamageDoc.exists) {
            return {
                id: updatedDamageDoc.id,
                ...updatedDamageDoc.data()
            } as Damage;
        } else {
            return null;
        }
    }
}