import * as admin from 'firebase-admin';
import { db } from '@/config/db';
import Crypto from 'crypto';

export enum State {
    Active = "active",
    Inactive = "inactive",
}

// Enum for Role
export enum Role {
    Admin = "admin",
    Member = "member",
    Bootmanager = "Bootmanager",
    Cashier = "cashier",
}

export interface User {
    // The id of the user in the database
    id: string;

    // Personal information
    firstName: string;
    lastName: string;
    name: string;
    email: string;

    // State management and Privileges
    State?: State;
    Role?: Role;

    // Reservation and Session management
    Reservation?: string[];
    Session_Key?: string;
    DamageReport?: string[];
    authCode?: string;

    // Timestamps
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
}

class UserModel {
    private static usersRef = db.collection('users');

    static async createUser(user: Omit<User, 'id' | 'name' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const userData = {
            ...user,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const userDocRef = await this.usersRef.add(userData);

        const createdUserDoc = await userDocRef.get();
        const createdUserData = createdUserDoc.data();

        if (createdUserData) {
            return {
                id: userDocRef.id,
                firstName: createdUserData.firstName,
                lastName: createdUserData.lastName,
                name: createdUserData.firstName + " " + createdUserData.lastName,
                email: createdUserData.email,
                State: createdUserData.State || State.Active,
                Role: createdUserData.Role || Role.Member,
                Reservation: createdUserData.Reservation || [],
                Session_Key: createdUserData.Session_Key || "",
                DamageReport: createdUserData.DamageReport || [],
                createdAt: createdUserData.createdAt,
                updatedAt: createdUserData.updatedAt,
            };
        } else {
            throw new Error("User not found after creation");
        }
    }

    static async getUserById(id: string): Promise<User | null> {
        const userDoc = await this.usersRef.doc(id).get();
        if (!userDoc.exists) {
            return null;
        }
        return { id: userDoc.id, ...userDoc.data() } as User;
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        const userDoc = await this.usersRef.where('email', '==', email).get();
        if (userDoc.empty) {
            return null;
        }
        return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() } as User;
    }

    static async getSessionKey(id: string): Promise<string | null> {
        const userDoc = await this.usersRef.doc(id).get();
        if (!userDoc.exists) {
            return null;
        }
        return userDoc.data()?.Session_Key || null;
    }

    static async getAllUsers(): Promise<Omit<User, 'firstName' | 'lastName' | 'Session_Key' | 'authCode'>[]> {
        const usersSnapshot = await this.usersRef.get();
        const users: Omit<User, 'firstName' | 'lastName' | 'Session_Key' | 'authCode'>[] = [];

        usersSnapshot.forEach((doc) => {
            const data = doc.data();

            users.push({
                id: doc.id,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                State: data.State,
                Role: data.Role,
                Reservation: data.Reservation,
                DamageReport: data.DamageReport,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });
        });

        return users;
    }

    static async deleteUser(id: string): Promise<void> {
        await this.usersRef.doc(id).delete();
    }

    static async getUserBySessionKey(sessionKey: string): Promise<User | null> {
        const userDoc = await this.usersRef.where('Session_Key', '==', sessionKey).get();
        if (userDoc.empty) {
            return null;
        }
        return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() } as User;
    }

    static async generateSessionKey(userId: string): Promise<void> {
        const sessionKey = Crypto.randomBytes(64).toString('hex');
        const userRef = this.usersRef.doc(userId);
        await userRef.update({ Session_Key: sessionKey });
    }

    static async clearUserSessionKey(id: string): Promise<void> {
        const userRef = this.usersRef.doc(id);
        await userRef.update({ Session_Key: "" });
    }

    static async storeAuthCode(email: string, code: string): Promise<void> {
        const userRef = this.usersRef.where('email', '==', email);
        const userDoc = await userRef.get();

        if (userDoc.empty) {
            throw new Error("User not found");
        }

        const userId = userDoc.docs[0].id;
        await this.usersRef.doc(userId).update({ authCode: code });
    }

    static async verifyAuthCode(email: string, code: string): Promise<boolean> {
        const userRef = this.usersRef.where('email', '==', email);
        const userDoc = await userRef.get();

        if (userDoc.empty) {
            throw new Error("User not found");
        }

        const userId = userDoc.docs[0].id;
        const userData = await this.getUserById(userId);

        if (userData && userData.authCode === code) {
            return true;
        } else {
            return false;
        }
    }

    static async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        const updateData = {
            ...data,
            updatedAt: timestamp
        };

        const userRef = this.usersRef.doc(id);
        await userRef.update(updateData);
        const updatedUserDoc = await userRef.get();

        return { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;
    }
}

export default UserModel;