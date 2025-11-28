export interface ReceiptItem {
    id: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    assignedTo: string[]; // Array of person IDs
}

export interface Person {
    id: string;
    name: string;
    color: string; // Hex code for UI
}

export interface ReceiptData {
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    tip: number;
    miscellaneous?: number;
    total: number;
    title?: string;
}

export type AppPhase = 'capture' | 'assignment' | 'settlement';

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface SavedReceipt {
    id: string;
    receipt: ReceiptData;
    people: Person[];
    createdAt: Date;
    userId: string;
}
