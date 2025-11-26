import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ReceiptData, Person } from '../types';

export interface SavedReceipt {
    id: string;
    receipt: ReceiptData;
    people: Person[];
    createdAt: Date;
    userId: string;
}

/**
 * Save a receipt to Firestore
 */
export const saveReceipt = async (
    userId: string,
    receipt: ReceiptData,
    people: Person[]
): Promise<string> => {
    try {
        const receiptsRef = collection(db, 'users', userId, 'receipts');
        const docRef = await addDoc(receiptsRef, {
            receipt,
            people,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving receipt:', error);
        throw error;
    }
};

/**
 * Load all receipts for a user
 */
export const loadReceipts = async (userId: string): Promise<SavedReceipt[]> => {
    try {
        const receiptsRef = collection(db, 'users', userId, 'receipts');
        const q = query(receiptsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                receipt: data.receipt as ReceiptData,
                people: data.people as Person[],
                createdAt: data.createdAt.toDate(),
                userId,
            };
        });
    } catch (error) {
        console.error('Error loading receipts:', error);
        throw error;
    }
};

/**
 * Delete a receipt from Firestore
 */
export const deleteReceipt = async (userId: string, receiptId: string): Promise<void> => {
    try {
        const receiptRef = doc(db, 'users', userId, 'receipts', receiptId);
        await deleteDoc(receiptRef);
    } catch (error) {
        console.error('Error deleting receipt:', error);
        throw error;
    }
};
