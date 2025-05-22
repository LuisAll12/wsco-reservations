import * as admin from 'firebase-admin';
import { db } from '../config/db';

export interface Checklist {
    // The id of the checklist in the database
    id: string;

    // Checklist details
    name: string;
    description: string;
    items: string[];
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

class ChecklistModel {
    private static checklistsRef = db.collection('checklists');

    static async createChecklist(checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checklist> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const checklistData = {
            ...checklist,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const checklistDocRef = await this.checklistsRef.add(checklistData);

        const createdChecklistDoc = await checklistDocRef.get();
        const createdChecklistData = createdChecklistDoc.data();

        if (createdChecklistData) {
            return {
                id: checklistDocRef.id,
                ...createdChecklistData
            } as Checklist;
        } else {
            throw new Error('Failed to create checklist');
        }
    }

    static async getChecklistById(checklistId: string): Promise<Checklist | null> {
        const checklistDoc = await this.checklistsRef.doc(checklistId).get();
        if (checklistDoc.exists) {
            const checklistData = checklistDoc.data();
            return {
                id: checklistDoc.id,
                ...checklistData
            } as Checklist;
        } else {
            return null;
        }
    }

    static async updateChecklist(checklistId: string, checklist: Partial<Omit<Checklist, 'id' | 'createdAt'>>): Promise<Checklist | null> {
        const checklistDocRef = this.checklistsRef.doc(checklistId);
        await checklistDocRef.update({
            ...checklist,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const updatedChecklistDoc = await checklistDocRef.get();
        if (updatedChecklistDoc.exists) {
            const updatedChecklistData = updatedChecklistDoc.data();
            return {
                id: updatedChecklistDoc.id,
                ...updatedChecklistData
            } as Checklist;
        } else {
            return null;
        }
    }

    static async deleteChecklist(checklistId: string): Promise<void> {
        const checklistDocRef = this.checklistsRef.doc(checklistId);
        await checklistDocRef.delete();
    }

    static async getAllChecklists(): Promise<Checklist[]> {
        const snapshot = await this.checklistsRef.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Checklist));
    }

    static async addChecklistItem(checklistId: string, item: string): Promise<void> {
        const checklistDocRef = this.checklistsRef.doc(checklistId);
        await checklistDocRef.update({
            items: admin.firestore.FieldValue.arrayUnion(item)
        });
    }

    static async removeChecklistItem(checklistId: string, item: string): Promise<void> {
        const checklistDocRef = this.checklistsRef.doc(checklistId);
        await checklistDocRef.update({
            items: admin.firestore.FieldValue.arrayRemove(item)
        });
    }
}

export default ChecklistModel;