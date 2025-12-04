import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { X, LogOut, History, ChevronRight, Mail, Users } from 'lucide-react';
import { HistoryModal } from './HistoryModal';
import { GroupsModal } from './GroupsModal';

interface ProfileModalProps {
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user, signOutUser, savedGroups } = useAppStore();
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showGroupsModal, setShowGroupsModal] = useState(false);

    const [imgError, setImgError] = useState(false);

    if (!user) return null;

    const handleSignOut = async () => {
        await signOutUser();
        onClose();
    };

    return createPortal(
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-gray-50 w-full h-[90dvh] sm:h-auto sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                        <div className="w-8" /> {/* Spacer for centering */}
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">Profile</h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* User Info Card */}
                        <div className="flex flex-col items-center pt-4 pb-6">
                            <div className="relative mb-4 group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 blur-xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity" />
                                {user.photoURL && !imgError ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        onError={() => setImgError(true)}
                                        className="relative w-24 h-24 rounded-full border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] object-cover"
                                    />
                                ) : (
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                        <span className="text-4xl font-bold text-white">
                                            {(user.displayName || user.email || '?')[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 tracking-tight text-center">
                                {user.displayName || 'User'}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{user.email}</span>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-3">
                            <p className="px-1 text-[10px] uppercase tracking-wider font-bold text-gray-400">Account</p>

                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Receipt History</div>
                                        <div className="text-xs text-gray-500 font-medium">View your past splits</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={() => setShowGroupsModal(true)}
                                className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Saved Groups</div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            {savedGroups.length === 0 ? 'Create reusable groups' : `${savedGroups.length} group${savedGroups.length === 1 ? '' : 's'} saved`}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900">Sign Out</div>
                                        <div className="text-xs text-gray-500 font-medium">Log out of your account</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Version Info */}
                    <div className="p-6 text-center">
                        <p className="text-[10px] text-gray-300 font-medium">
                            BillBeam v1.0.0
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showHistoryModal && (
                    <HistoryModal
                        onClose={() => setShowHistoryModal(false)}
                        onReceiptSelect={onClose}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showGroupsModal && (
                    <GroupsModal
                        onClose={() => setShowGroupsModal(false)}
                    />
                )}
            </AnimatePresence>
        </>,
        document.body
    );
};
