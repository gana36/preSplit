import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ReceiptData, Person, AppPhase, ReceiptItem, User, SavedReceipt, SavedGroup, UserPreferences } from './types';
import { onAuthStateChange, signInWithGoogle, signOut } from './services/auth';
import {
    saveReceipt as saveReceiptToFirestore,
    loadReceipts,
    deleteReceipt,
    updateReceipt,
    saveGroup as saveGroupToFirestore,
    loadGroups,
    updateGroup as updateGroupInFirestore,
    deleteGroup as deleteGroupFromFirestore,
    saveUserPreferences,
    loadUserPreferences
} from './services/firestore';
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
    savedGroups: SavedGroup[];
    userPreferences: UserPreferences | null;
    recentNames: string[];
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
    createGroup: (name: string) => Promise<void>;
    loadGroup: (group: SavedGroup, silent?: boolean) => boolean;
    updateGroupDetails: (groupId: string, name: string, people?: Person[]) => Promise<void>;
    deleteGroupById: (groupId: string) => Promise<void>;
    setDefaultGroup: (groupId: string | null) => Promise<void>;
    refreshGroups: () => Promise<void>;
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
    const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [recentNames, setRecentNames] = useState<string[]>([]);

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
                // Load data when user signs in
                loadUserData(firebaseUser.uid);
            } else {
                setUser(null);
                setReceiptHistory([]);
                setSavedGroups([]);
                setUserPreferences(null);
                setRecentNames([]);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Update recent names when receipt history changes
    useEffect(() => {
        const names = extractRecentNames(receiptHistory);
        setRecentNames(names);
    }, [receiptHistory]);

    // Load all user data (receipts, groups, preferences)
    const loadUserData = async (userId: string) => {
        try {
            const [receipts, groups, preferences] = await Promise.all([
                loadReceipts(userId),
                loadGroups(userId),
                loadUserPreferences(userId)
            ]);
            setReceiptHistory(receipts);
            setSavedGroups(groups);
            setUserPreferences(preferences);
        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Failed to load your data');
        }
    };

    // Extract recent names from receipt history
    const extractRecentNames = (receipts: SavedReceipt[]): string[] => {
        const nameMap = new Map<string, Date>();

        receipts.forEach(receipt => {
            receipt.people.forEach(person => {
                const existingDate = nameMap.get(person.name);
                if (!existingDate || receipt.createdAt > existingDate) {
                    nameMap.set(person.name, receipt.createdAt);
                }
            });
        });

        return Array.from(nameMap.entries())
            .sort((a, b) => b[1].getTime() - a[1].getTime())
            .map(([name]) => name)
            .slice(0, 15);
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
            await loadUserData(user.uid);
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
            await loadUserData(user.uid);
        } catch (error) {
            console.error('Error deleting receipt:', error);
            toast.error('Failed to delete receipt');
        }
    };

    const refreshHistory = async () => {
        if (!user) return;
        await loadUserData(user.uid);
    };

    // Group management methods
    const createGroup = async (name: string) => {
        if (!user || people.length === 0) {
            if (!user) toast.error('Please sign in to save groups');
            if (people.length === 0) toast.error('Add people before creating a group');
            return;
        }

        // Validate group name
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error('Group name cannot be empty');
            return;
        }

        // Check for duplicate names (case-insensitive)
        if (savedGroups.some(g => g.name.toLowerCase() === trimmedName.toLowerCase())) {
            toast.error('A group with this name already exists');
            return;
        }

        // Limit group size to 30 people
        if (people.length > 30) {
            toast.error('Groups are limited to 30 people');
            return;
        }

        try {
            await saveGroupToFirestore(user.uid, trimmedName, people);
            toast.success(`Group "${trimmedName}" created!`);
            await refreshGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Failed to create group');
        }
    };

    const loadGroup = (group: SavedGroup, silent = false): boolean => {
        // Preserve colors by matching names if possible
        const newPeople = group.people.map((person, index) => {
            const existingPerson = people.find(p => p.name === person.name);
            return {
                ...person,
                id: crypto.randomUUID(),
                color: existingPerson?.color || COLORS[index % COLORS.length]
            };
        });
        setPeople(newPeople);
        if (!silent) {
            toast.success(`Loaded group "${group.name}"`);
        }
        return true;
    };

    const updateGroupDetails = async (groupId: string, name: string, updatedPeople?: Person[]) => {
        if (!user) return;

        // Validate group name
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error('Group name cannot be empty');
            return;
        }

        // Check for duplicate names (excluding current group)
        if (savedGroups.some(g => g.id !== groupId && g.name.toLowerCase() === trimmedName.toLowerCase())) {
            toast.error('A group with this name already exists');
            return;
        }

        try {
            const peopleToSave = updatedPeople || people;
            await updateGroupInFirestore(user.uid, groupId, trimmedName, peopleToSave);
            toast.success('Group updated!');
            await refreshGroups();
        } catch (error) {
            console.error('Error updating group:', error);
            toast.error('Failed to update group');
        }
    };

    const deleteGroupById = async (groupId: string) => {
        if (!user) return;

        try {
            await deleteGroupFromFirestore(user.uid, groupId);
            // If this was the default group, clear the preference
            if (userPreferences?.defaultGroupId === groupId) {
                await setDefaultGroup(null);
            }
            toast.success('Group deleted');
            await refreshGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
            toast.error('Failed to delete group');
        }
    };

    const setDefaultGroup = async (groupId: string | null) => {
        if (!user) return;

        try {
            const newPreferences: UserPreferences = { defaultGroupId: groupId };
            await saveUserPreferences(user.uid, newPreferences);
            setUserPreferences(newPreferences);
            if (groupId) {
                const group = savedGroups.find(g => g.id === groupId);
                toast.success(`Default group set to "${group?.name}"`);
            } else {
                toast.success('Default group cleared');
            }
        } catch (error) {
            console.error('Error setting default group:', error);
            toast.error('Failed to update default group');
        }
    };

    const refreshGroups = async () => {
        if (!user) return;
        try {
            const groups = await loadGroups(user.uid);
            setSavedGroups(groups);
        } catch (error) {
            console.error('Error refreshing groups:', error);
        }
    };

    const value = {
        phase,
        receipt,
        people,
        user,
        authLoading,
        receiptHistory,
        currentReceiptId,
        savedGroups,
        userPreferences,
        recentNames,
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
        refreshHistory,
        createGroup,
        loadGroup,
        updateGroupDetails,
        deleteGroupById,
        setDefaultGroup,
        refreshGroups
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

