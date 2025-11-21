import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ReceiptData, Person, AppPhase } from './types';

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

    const reset = () => {
        setPhase('capture');
        setReceipt(null);
        setPeople([]);
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
        reset
    };

    return (
        <AppContext.Provider value= { value } >
        { children }
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

