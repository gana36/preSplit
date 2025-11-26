import React, { useState } from 'react';
import { useAppStore } from '../store';
import { LogIn, User as UserIcon } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { AnimatePresence } from 'framer-motion';

export const AuthButton: React.FC = () => {
    const { user, authLoading, signIn } = useAppStore();
    const [showProfileModal, setShowProfileModal] = useState(false);

    if (authLoading) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <button
                onClick={signIn}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Sign in with Google"
            >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">Login</span>
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowProfileModal(true)}
                className="relative group outline-none"
                aria-label="Open profile"
            >
                <div className="absolute inset-0 bg-blue-500 blur opacity-0 group-hover:opacity-20 transition-opacity rounded-full duration-500" />
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="relative w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform group-active:scale-95 object-cover"
                    />
                ) : (
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-white shadow-sm transition-transform group-active:scale-95">
                        <UserIcon className="w-4 h-4 text-white" />
                    </div>
                )}
            </button>

            <AnimatePresence>
                {showProfileModal && (
                    <ProfileModal onClose={() => setShowProfileModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
};
