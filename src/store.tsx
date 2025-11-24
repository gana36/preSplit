import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ReceiptData, Person, AppPhase, ReceiptItem } from './types';

interface AppState {
    phase: AppPhase;
    receipt: ReceiptData | null;
    people: Person[];
}

interface AppContextType extends AppState {
    setPhase: (phase: AppPhase) => void;
    setReceipt: (receipt: ReceiptData) => void;
    addPerson: (name: string) => void;
    removePerson: (id: string) => void;
    toggleAssignment: (itemId: string, personId: string) => void;
    updateItemPrice: (itemId: string, price: number) => void;
    updateItem: (itemId: string, updates: Partial<ReceiptItem>) => void;
    updateReceiptTotals: (updates: { tax?: number; tip?: number; miscellaneous?: number }) => void;
    assignAllToAll: () => void;
    clearAllAssignments: () => void;
    reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [phase, setPhase] = useState<AppPhase>('capture');
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [people, setPeople] = useState<Person[]>([]);

    const addPerson = (name: string) => {
        const newPerson: Person = {
            id: crypto.randomUUID(),
            name,
            color: COLORS[people.length % COLORS.length],
        };
        setPeople([...people, newPerson]);
    };

    const removePerson = (id: string) => {
        setPeople(people.filter(p => p.id !== id));
        // Also remove from assignments
        if (receipt) {
            setReceipt({
                ...receipt,
                items: receipt.items.map(item => ({
                    ...item,
                    assignedTo: item.assignedTo.filter(pId => pId !== id)
                }))
            });
        }
    };

    const toggleAssignment = (itemId: string, personId: string) => {
        if (!receipt) return;
        setReceipt({
            ...receipt,
            items: receipt.items.map(item => {
                if (item.id !== itemId) return item;
                const isAssigned = item.assignedTo.includes(personId);
                return {
                    ...item,
                    assignedTo: isAssigned
                        ? item.assignedTo.filter(id => id !== personId)
                        : [...item.assignedTo, personId]
                };
            })
        });
    };

    const updateItemPrice = (itemId: string, price: number) => {
        if (!receipt) return;
        setReceipt({
            ...receipt,
            items: receipt.items.map(item =>
                item.id === itemId ? { ...item, price } : item
            )
        });
    };

    const updateItem = (itemId: string, updates: Partial<ReceiptItem>) => {
        if (!receipt) return;

        const updatedItems = receipt.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );

        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
        const newTotal = newSubtotal + (receipt.tax || 0) + (receipt.tip || 0) + (receipt.miscellaneous || 0);

        setReceipt({
            ...receipt,
            items: updatedItems,
            subtotal: newSubtotal,
            total: newTotal
        });
    };

    const updateReceiptTotals = (updates: { tax?: number; tip?: number; miscellaneous?: number }) => {
        if (!receipt) return;

        const newTax = updates.tax !== undefined ? updates.tax : receipt.tax;
        const newTip = updates.tip !== undefined ? updates.tip : receipt.tip;
        const newMisc = updates.miscellaneous !== undefined ? updates.miscellaneous : (receipt.miscellaneous || 0);

        const newSubtotal = receipt.subtotal;
        const newTotal = newSubtotal + newTax + newTip + newMisc;

        setReceipt({
            ...receipt,
            tax: newTax,
            tip: newTip,
            miscellaneous: newMisc,
            total: newTotal
        });
    };

    const reset = () => {
        setPhase('capture');
        setReceipt(null);
        setPeople([]);
    };

    const assignAllToAll = () => {
        if (!receipt) return;
        const allPersonIds = people.map(p => p.id);
        const updatedItems = receipt.items.map(item => ({
            ...item,
            assignedTo: [...allPersonIds]
        }));
        setReceipt({ ...receipt, items: updatedItems });
    };

    const clearAllAssignments = () => {
        if (!receipt) return;
        const updatedItems = receipt.items.map(item => ({
            ...item,
            assignedTo: []
        }));
        setReceipt({ ...receipt, items: updatedItems });
    };

    const value = {
        phase,
        receipt,
        people,
        setPhase,
        setReceipt,
        addPerson,
        removePerson,
        toggleAssignment,
        updateItemPrice,
        updateItem,
        updateReceiptTotals,
        reset,
        assignAllToAll,
        clearAllAssignments
    };

    return (
        <AppContext.Provider value={value} >
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppStore must be used within an AppProvider');
    }
    return context;
};

