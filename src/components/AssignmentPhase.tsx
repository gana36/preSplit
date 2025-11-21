import React from 'react';
import { useAppStore } from '../store';
import { PersonPills } from './PersonPills';
import { ReceiptItemList } from './ReceiptItemList';
import { ArrowRight } from 'lucide-react';

export const AssignmentPhase: React.FC = () => {
    const { setPhase, receipt, people } = useAppStore();

    // Calculate progress
    const totalItems = receipt?.items.length || 0;
    const assignedItems = receipt?.items.filter(i => i.assignedTo.length > 0).length || 0;

    return (
        <div className="flex flex-col h-full relative">
            <div className="p-4 pb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Assign Items</h2>
                <p className="text-sm text-gray-500 mb-4">Tap people, then tap items to assign</p>

                <PersonPills />
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                <ReceiptItemList />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-md sticky bottom-0">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                    <span>{assignedItems} of {totalItems} items assigned</span>
                    <span>${receipt?.subtotal.toFixed(2)} Subtotal</span>
                </div>

                <button
                    onClick={() => setPhase('settlement')}
                    disabled={people.length === 0}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    Review & Settle
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

