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
                    onClick={() => {
                        if (!settlementData.length) return;

                        const breakdown = settlementData.map(d => {
                            const itemsList = d.items.map(item =>
                                `• ${item.description}: $${(item.price / item.assignedTo.length).toFixed(2)}`
                            ).join('\n');
                            return `${String.fromCodePoint(0x1F464)} *${d.person.name}*\n${itemsList}\nTotal: $${d.total.toFixed(2)}`;
                        }).join('\n\n');

                        const billDetails = `${String.fromCodePoint(0x1F4B0)} *Bill Details*\nSubtotal: $${receipt?.subtotal.toFixed(2)}\nTax: $${receipt?.tax?.toFixed(2) || '0.00'}\nTip: $${receipt?.tip?.toFixed(2) || '0.00'}\nTotal: $${receipt?.total.toFixed(2)}`;

                        const text = `${String.fromCodePoint(0x1F9FE)} *SmartSplit Receipt*\n\n${breakdown}\n\n${billDetails}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Share to WhatsApp
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
