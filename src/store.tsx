import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ReceiptData, Person, AppPhase, ReceiptItem, User, SavedReceipt } from './types';
import { onAuthStateChange, signInWithGoogle, signOut } from './services/auth';
import { saveReceipt as saveReceiptToFirestore, loadReceipts, deleteReceipt, updateReceipt } from './services/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import toast from 'react-hot-toast';

interface AppState {
    phase: AppPhase;
    receipt: ReceiptData | null;
    people: Person[];
    user: User | null;
    authLoading: boolean;
    receiptHistory: SavedReceipt[];
    currentReceiptId: string | null;
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
    updateReceiptTitle: (title: string) => void;
    assignAllToAll: () => void;
    clearAllAssignments: () => void;
    reset: () => void;
    signIn: () => Promise<void>;
    signOutUser: () => Promise<void>;
    saveCurrentReceipt: () => Promise<void>;
    loadReceipt: (savedReceipt: SavedReceipt) => void;
    deleteReceiptFromHistory: (receiptId: string) => Promise<void>;
    refreshHistory: () => Promise<void>;
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
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [receiptHistory, setReceiptHistory] = useState<SavedReceipt[]>([]);
    const [currentReceiptId, setCurrentReceiptId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChange((firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userData: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                };
                setUser(userData);
                // Load receipt history when user signs in
                loadReceiptsForUser(firebaseUser.uid);
            } else {
                setUser(null);
                setReceiptHistory([]);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load receipts for a user
    const loadReceiptsForUser = async (userId: string) => {
        try {
            const receipts = await loadReceipts(userId);
            setReceiptHistory(receipts);
        } catch (error) {
            console.error('Error loading receipts:', error);
            toast.error('Failed to load receipt history');
        }
    };

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

    const updateReceiptTitle = (title: string) => {
        if (!receipt) return;
        setReceipt({ ...receipt, title });
    };

    const reset = () => {
        setPhase('capture');
        setReceipt(null);
        setPeople([]);
        setCurrentReceiptId(null);
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

    // Auth methods
    const signIn = async () => {
        try {
            await signInWithGoogle();
            toast.success('Signed in successfully!');
        } catch (error) {
            console.error('Sign in error:', error);
            toast.error('Failed to sign in. Please try again.');
        }
    };

    const signOutUser = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error('Failed to sign out');
        }
    };

    const saveCurrentReceipt = async () => {
        if (!user || !receipt || isSaving) {
            if (!user) toast.error('Please sign in to save receipts');
            return;
        }

        setIsSaving(true);
        try {
            if (currentReceiptId) {
                await updateReceipt(user.uid, currentReceiptId, receipt, people);
                toast.success('Receipt updated!');
            } else {
                const newId = await saveReceiptToFirestore(user.uid, receipt, people);
                setCurrentReceiptId(newId);
                toast.success('Receipt saved successfully!');
            }
            // Refresh history
            await loadReceiptsForUser(user.uid);
        } catch (error) {
            console.error('Error saving receipt:', error);
            toast.error('Failed to save receipt');
        } finally {
            setIsSaving(false);
        }
    };

    const loadReceipt = (savedReceipt: SavedReceipt) => {
        setReceipt(savedReceipt.receipt);
        setPeople(savedReceipt.people);
        setCurrentReceiptId(savedReceipt.id);
        setPhase('assignment');
        toast.success('Receipt loaded!');
    };

    const deleteReceiptFromHistory = async (receiptId: string) => {
        if (!user) return;

        try {
            await deleteReceipt(user.uid, receiptId);
            toast.success('Receipt deleted');
            // Refresh history
            await loadReceiptsForUser(user.uid);
        } catch (error) {
            console.error('Error deleting receipt:', error);
            toast.error('Failed to delete receipt');
        }
    };

    const refreshHistory = async () => {
        if (!user) return;
        await loadReceiptsForUser(user.uid);
    };

    const value = {
        phase,
        receipt,
        people,
        user,
        authLoading,
        receiptHistory,
        currentReceiptId,
        setPhase,
        setReceipt,
        addPerson,
        removePerson,
        toggleAssignment,
        updateItemPrice,
        updateItem,
        updateReceiptTotals,
        updateReceiptTitle,
        reset,
        assignAllToAll,
        clearAllAssignments,
        signIn,
        signOutUser,
        saveCurrentReceipt,
        loadReceipt,
        deleteReceiptFromHistory,
        refreshHistory
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

