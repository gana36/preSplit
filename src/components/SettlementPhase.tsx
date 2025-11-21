import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { Share2, RotateCcw, CheckCircle2 } from 'lucide-react';

export const SettlementPhase: React.FC = () => {
    const { receipt, people, reset } = useAppStore();

    const settlementData = useMemo(() => {
        if (!receipt) return [];

        const totalAssigned = receipt.items.reduce((sum, item) => {
            return item.assignedTo.length > 0 ? sum + item.price : sum;
        }, 0);

        // Calculate tax/tip ratio based on subtotal (or total assigned if subtotal is missing/mismatched)
        // For simplicity, we distribute tax/tip proportionally to the assigned value
        const taxTipTotal = (receipt.tax || 0) + (receipt.tip || 0);
        const ratio = totalAssigned > 0 ? (1 + taxTipTotal / receipt.subtotal) : 1;

        return people.map(person => {
            const personItems = receipt.items.filter(item => item.assignedTo.includes(person.id));
            const subtotal = personItems.reduce((sum, item) => {
                // Split price if assigned to multiple people
                return sum + (item.price / item.assignedTo.length);
            }, 0);

            const total = subtotal * ratio;

            return {
                person,
                items: personItems,
                subtotal,
                total
            };
        }).filter(data => data.total > 0);
    }, [receipt, people]);

    const handleShare = async () => {
        if (!settlementData.length) return;

        const text = settlementData.map(d =>
            `${d.person.name}: $${d.total.toFixed(2)}`
        ).join('\n');

        const shareData = {
            title: 'SmartSplit Receipt',
            text: `Here is the split:\n\n${text}\n\nTotal: $${receipt?.total.toFixed(2)}`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert('Copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-8 mt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">All Settled!</h2>
                <p className="text-gray-500">Here's what everyone owes</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {settlementData.map(({ person, total, items }) => (
                    <div key={person.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                                style={{ backgroundColor: person.color }}
                            >
                                {person.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{person.name}</h3>
                                <p className="text-xs text-gray-500">{items.length} items</p>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                            ${total.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 mt-auto">
                <button
                    onClick={handleShare}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Share Breakdown
                </button>

                <button
                    onClick={reset}
                    className="w-full bg-white text-gray-600 border border-gray-200 py-3.5 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Start New Split
                </button>
            </div>
        </div>
    );
};
