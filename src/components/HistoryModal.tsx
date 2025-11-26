import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { X, Trash2, Receipt, ArrowRight, Calendar } from 'lucide-react';

interface HistoryModalProps {
    onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
    const { receiptHistory, loadReceipt, deleteReceiptFromHistory } = useAppStore();

    const handleLoadReceipt = (receipt: typeof receiptHistory[0]) => {
        loadReceipt(receipt);
        onClose();
    };

    const handleDeleteReceipt = async (receiptId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this receipt?')) {
            await deleteReceiptFromHistory(receiptId);
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return createPortal(
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
                className="bg-gray-50 w-full h-[90dvh] sm:h-[80vh] sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="w-8" /> {/* Spacer */}
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">History</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {receiptHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full pb-20 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                                <Receipt className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                No saved receipts
                            </h3>
                            <p className="text-sm text-gray-500 max-w-[240px] font-medium leading-relaxed">
                                Your saved splits will appear here. Save a receipt after settling to keep track of it.
                            </p>
                        </div>
                    ) : (
                        receiptHistory.map((savedReceipt) => (
                            <motion.div
                                key={savedReceipt.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden active:scale-[0.99] transition-all"
                                onClick={() => handleLoadReceipt(savedReceipt)}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-gray-500" />
                                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                                                    {formatDate(savedReceipt.createdAt)}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-medium text-gray-400">
                                                {formatTime(savedReceipt.createdAt)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteReceipt(savedReceipt.id, e)}
                                            className="p-1.5 -mt-1.5 -mr-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                    ${savedReceipt.receipt.total.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex -space-x-1.5">
                                                        {savedReceipt.people.slice(0, 3).map((person, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                                                                style={{ backgroundColor: person.color }}
                                                            >
                                                                {person.name[0]}
                                                            </div>
                                                        ))}
                                                        {savedReceipt.people.length > 3 && (
                                                            <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                                +{savedReceipt.people.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500">
                                                        {savedReceipt.people.length} people
                                                    </span>
                                                </div>

                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />

                                                <span className="text-xs font-medium text-gray-500">
                                                    {savedReceipt.receipt.items.length} items
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};
