import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store';
import { Share2, RotateCcw, CheckCircle2, ArrowLeft, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettlementPhase: React.FC = () => {
    const { receipt, people, reset, setPhase } = useAppStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [roundToDollar, setRoundToDollar] = useState(false);

    const settlementData = useMemo(() => {
        if (!receipt) return [];

        const totalAssigned = receipt.items.reduce((sum, item) => {
            return item.assignedTo.length > 0 ? sum + item.price : sum;
        }, 0);

        // Calculate tax/tip ratio based on subtotal
        const taxTipTotal = (receipt.tax || 0) + (receipt.tip || 0) + (receipt.miscellaneous || 0);
        const ratio = totalAssigned > 0 ? (1 + taxTipTotal / receipt.subtotal) : 1;

        return people.map(person => {
            const personItems = receipt.items.filter(item => item.assignedTo.includes(person.id));

            // Calculate exact share for each item
            const itemDetails = personItems.map(item => ({
                ...item,
                sharePrice: item.price / item.assignedTo.length
            }));

            let subtotal = itemDetails.reduce((sum, item) => sum + item.sharePrice, 0);
            let total = subtotal * ratio;

            if (roundToDollar) {
                total = Math.round(total);
                // Adjust subtotal proportionally for display (approximate)
                subtotal = total / ratio;
            }

            const extraCosts = total - subtotal;

            return {
                person,
                items: itemDetails,
                subtotal,
                extraCosts,
                total
            };
        }).filter(data => data.total > 0);
    }, [receipt, people, roundToDollar]);

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

    const copyIndividual = (e: React.MouseEvent, data: typeof settlementData[0]) => {
        e.stopPropagation();
        const itemsList = data.items.map(item =>
            `• ${item.description}: $${item.sharePrice.toFixed(2)}`
        ).join('\n');
        const text = `${String.fromCodePoint(0x1F464)} *${data.person.name}*\n${itemsList}\nTotal: $${data.total.toFixed(2)}`;

        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50/50 relative overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 pt-8 pb-4 rounded-b-3xl shadow-sm z-10 flex-none relative">
                <div className="relative text-center mb-3">
                    <button
                        onClick={() => setPhase('assignment')}
                        className="absolute left-0 top-1 p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-2">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-500 mb-1">Total Bill</h2>
                    <div className="text-3xl font-black text-gray-900 tracking-tight">
                        ${receipt?.total.toFixed(2)}
                    </div>
                </div>

                {/* Smart Rounding Toggle */}
                <div className="flex justify-center">
                    <button
                        onClick={() => setRoundToDollar(!roundToDollar)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${roundToDollar
                            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <div className={`w-3 h-3 rounded-full border ${roundToDollar ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`} />
                        Round to nearest $1
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 pb-32">
                {settlementData.map((data) => {
                    const { person, total, subtotal, extraCosts, items } = data;
                    const isExpanded = expandedId === person.id;

                    return (
                        <motion.div
                            key={person.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : person.id)}
                                className="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white"
                                        style={{ backgroundColor: person.color }}
                                    >
                                        {person.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{person.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {items.length} items
                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                            ${total.toFixed(2)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => copyIndividual(e, data)}
                                        className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                        title="Copy details"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-gray-50/50 border-t border-gray-100"
                                    >
                                        <div className="p-3.5 space-y-3 text-sm">
                                            <div className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="flex justify-between items-start">
                                                        <span className="text-gray-600 flex-1 pr-4">{item.description}</span>
                                                        <span className="font-medium text-gray-900">${item.sharePrice.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                                <div className="flex justify-between text-gray-500 text-xs">
                                                    <span>Subtotal</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-500 text-xs">
                                                    <span>Tax, Tip & Misc</span>
                                                    <span>${extraCosts.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 space-y-2.5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        onClick={handleShare}
                        className="bg-gray-900 text-white py-4 rounded-xl font-semibold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={() => {
                            if (!settlementData.length) return;

                            const breakdown = settlementData.map(d => {
                                const itemsList = d.items.map(item =>
                                    `• ${item.description}: $${item.sharePrice.toFixed(2)}`
                                ).join('\n');
                                return `${String.fromCodePoint(0x1F464)} *${d.person.name}*\n${itemsList}\nTotal: $${d.total.toFixed(2)}`;
                            }).join('\n\n');

                            const billDetails = `${String.fromCodePoint(0x1F4B0)} *Bill Details*\nSubtotal: $${receipt?.subtotal.toFixed(2)}\nTax: $${receipt?.tax?.toFixed(2) || '0.00'}\nTip: $${receipt?.tip?.toFixed(2) || '0.00'}\nMisc: $${receipt?.miscellaneous?.toFixed(2) || '0.00'}\nTotal: $${receipt?.total.toFixed(2)}`;

                            const text = `${String.fromCodePoint(0x1F9FE)} *SmartSplit Receipt*\n\n${breakdown}\n\n${billDetails}`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-[#25D366] text-white py-4 rounded-xl font-semibold shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                    </button>
                </div>
                <button
                    onClick={reset}
                    className="w-full bg-white text-gray-600 border border-gray-200 py-4 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Start New Split
                </button>
            </div>
        </div>
    );
};
