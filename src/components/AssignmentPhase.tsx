import React from 'react';
import { useAppStore } from '../store';
import { PersonPills } from './PersonPills';
import { ReceiptItemList } from './ReceiptItemList';
import { ArrowRight, ChevronUp } from 'lucide-react';

const EditablePill: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
}> = ({ label, value, onChange }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempValue, setTempValue] = React.useState(value.toFixed(2));

    const handleSave = () => {
        const num = parseFloat(tempValue);
        if (!isNaN(num)) {
            onChange(num);
        } else {
            setTempValue(value.toFixed(2));
        }
        setIsEditing(false);
    };

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded border transition-all cursor-pointer ${isEditing
                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                : value > 0
                    ? 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    : 'bg-white border-dashed border-gray-200 hover:border-gray-300'
                }`}
        >
            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 leading-none tracking-wider">{label}</span>
            {isEditing ? (
                <div className="flex items-center justify-center w-full">
                    <span className="text-[10px] text-gray-400 mr-0.5">$</span>
                    <input
                        autoFocus
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="w-10 bg-transparent text-center font-bold text-gray-900 outline-none p-0 text-base"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            ) : (
                <span className={`text-xs font-bold ${value > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                    ${value.toFixed(2)}
                </span>
            )}
        </div>
    );
};

export const AssignmentPhase: React.FC = () => {
    const { setPhase, receipt, people, assignAllToAll, clearAllAssignments, updateReceiptTotals } = useAppStore();
    const [splitMode, setSplitMode] = React.useState<'manual' | 'equal'>('manual');
    const [highlightedId, setHighlightedId] = React.useState<string | null>(null);

    // Calculate progress
    const totalItems = receipt?.items.length || 0;
    const assignedItems = receipt?.items.filter(i => i.assignedTo.length > 0).length || 0;

    const handleModeSwitch = (mode: 'manual' | 'equal') => {
        // Prevent switching if no people added
        if (people.length === 0) {
            return;
        }

        // Update mode
        setSplitMode(mode);

        if (mode === 'equal') {
            // Switch to Equal: assign all items to all people
            assignAllToAll();
        } else {
            // Switch to Manual: clear all assignments
            clearAllAssignments();
        }
    };

    const canSwitchMode = people.length > 0;

    return (
        <div className="flex flex-col h-full relative">
            <div className="px-3 pt-2 pb-1">
                <PersonPills />

                <div className="flex bg-gray-100/60 backdrop-blur-sm p-1 rounded-xl shadow-inner mb-1 mt-2">
                    <button
                        onClick={() => handleModeSwitch('equal')}
                        disabled={!canSwitchMode}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${splitMode === 'equal'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : canSwitchMode
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Split Equally
                    </button>
                    <button
                        onClick={() => handleModeSwitch('manual')}
                        disabled={!canSwitchMode}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${splitMode === 'manual'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : canSwitchMode
                                ? 'text-gray-500 hover:text-gray-700'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Manual
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 mt-1">
                <ReceiptItemList highlightedItemId={highlightedId} />
            </div>

            <div className="p-2.5 border-t border-gray-100/50 bg-white/95 backdrop-blur-md pb-[max(12px,env(safe-area-inset-bottom))]">
                <div className="mb-2 bg-white rounded-xl p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-baseline gap-1.5">
                            <p className="text-xl font-black text-gray-900">${(receipt?.total || 0).toFixed(2)}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Total</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-medium">Sub <span className="font-bold text-gray-700">${(receipt?.subtotal || 0).toFixed(2)}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        <EditablePill
                            label="Tax"
                            value={receipt?.tax || 0}
                            onChange={(val) => updateReceiptTotals({ tax: val })}
                        />
                        <EditablePill
                            label="Tip"
                            value={receipt?.tip || 0}
                            onChange={(val) => updateReceiptTotals({ tip: val })}
                        />
                        <EditablePill
                            label="Misc"
                            value={receipt?.miscellaneous || 0}
                            onChange={(val) => updateReceiptTotals({ miscellaneous: val })}
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (people.length === 0) return;

                        if (assignedItems < totalItems) {
                            // Find first unassigned item
                            const firstUnassigned = receipt?.items.find(item => item.assignedTo.length === 0);
                            if (firstUnassigned) {
                                const element = document.getElementById(`item-${firstUnassigned.id}`);
                                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                // Highlight it temporarily
                                setHighlightedId(firstUnassigned.id);
                                setTimeout(() => setHighlightedId(null), 2000);
                            }
                        } else {
                            setPhase('settlement');
                        }
                    }}
                    className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] ${people.length > 0 && assignedItems === totalItems
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-gray-900/30 hover:shadow-gray-900/40 hover:shadow-xl'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {assignedItems < totalItems ? (
                        people.length === 0 ? (
                            <span>Add People to Start</span>
                        ) : (
                            <div className="flex items-center justify-between w-full px-4">
                                <span className="text-gray-600 font-medium">
                                    {totalItems - assignedItems} items left
                                </span>
                                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    Navigate
                                    <ChevronUp className="w-3 h-3" />
                                </div>
                            </div>
                        )
                    ) : (
                        <>
                            Review & Settle
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

