import React, { useState } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { useAppStore } from '../store';
import type { ReceiptItem } from '../types';

interface ReceiptItemCardProps {
    item: ReceiptItem;
    isHighlighted?: boolean;
}

const ReceiptItemCard: React.FC<ReceiptItemCardProps> = ({ item, isHighlighted }) => {
    const { updateItem, people, toggleAssignment } = useAppStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        description: item.description,
        price: (item.price || 0).toString(),
        discount: item.discount ? item.discount.toString() : '',
        originalPrice: item.originalPrice ? item.originalPrice.toString() : (item.price || 0).toString()
    });

    const handleSave = (e?: React.MouseEvent | React.FormEvent) => {
        e?.stopPropagation();
        const originalPrice = parseFloat(editForm.originalPrice) || 0;
        const discount = parseFloat(editForm.discount) || 0;
        const finalPrice = originalPrice - discount;

        updateItem(item.id, {
            description: editForm.description,
            price: finalPrice,
            originalPrice: discount > 0 ? originalPrice : undefined,
            discount: discount > 0 ? discount : undefined
        });
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    // Calculate dynamic values for display during edit
    const currentOriginal = parseFloat(editForm.originalPrice) || 0;
    const currentDiscount = parseFloat(editForm.discount) || 0;
    const currentFinal = currentOriginal - currentDiscount;

    return (
        <div
            id={`item-${item.id}`}
            className={`flex flex-col p-4 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all duration-300 group relative ${isEditing
                    ? 'ring-2 ring-blue-400 shadow-blue-100'
                    : isHighlighted
                        ? 'ring-2 ring-sky-400 shadow-sky-100'
                        : ''
                }`}
        >
            {!isEditing && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 active:scale-90"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )}

            <div className="flex justify-between items-start mb-3 pr-8">
                <div className="flex flex-col flex-1 mr-2">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editForm.description}
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onClick={e => e.stopPropagation()}
                            className="font-medium text-gray-900 bg-transparent border-b border-blue-300 focus:border-blue-600 outline-none p-0 rounded-none w-full"
                        />
                    ) : (
                        <span className="font-medium text-gray-900">{item.description}</span>
                    )}

                    {(item.discount || isEditing) && (
                        <div className="flex items-center gap-1 mt-0.5" onClick={e => e.stopPropagation()}>
                            {isEditing ? (
                                <>
                                    <span className="text-xs text-gray-400">$</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        value={editForm.originalPrice}
                                        onChange={e => setEditForm({ ...editForm, originalPrice: e.target.value })}
                                        className="text-xs text-gray-600 font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-16 p-0"
                                        placeholder="Orig"
                                    />
                                    <span className="text-xs text-gray-400">-</span>
                                    <span className="text-xs text-gray-400">$</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        value={editForm.discount}
                                        onChange={e => setEditForm({ ...editForm, discount: e.target.value })}
                                        className="text-xs text-green-600 font-medium bg-transparent border-b border-green-300 focus:border-green-600 outline-none w-12 p-0"
                                        placeholder="Disc"
                                    />
                                </>
                            ) : (
                                item.originalPrice && (
                                    <span className="text-xs text-green-600 font-medium">
                                        ${item.originalPrice.toFixed(2)} - ${item.discount?.toFixed(2)} discount
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-900">
                        ${isEditing ? currentFinal.toFixed(2) : (item.price || 0).toFixed(2)}
                    </span>
                    {isEditing && (
                        <button
                            onClick={handleSave}
                            className="mt-1 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-90 shadow-md transition-all duration-200"
                        >
                            <Check className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {people.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">Add people to assign</span>
                ) : (
                    people.map(person => {
                        const isAssigned = item.assignedTo.includes(person.id);
                        return (
                            <button
                                key={person.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAssignment(item.id, person.id);
                                }}
                                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2
                  ${isAssigned
                                        ? 'border-transparent text-white shadow-sm scale-105'
                                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-gray-100 grayscale'}
                `}
                                style={{
                                    backgroundColor: isAssigned ? person.color : undefined,
                                }}
                                title={person.name}
                            >
                                {person.name.charAt(0).toUpperCase()}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

interface ReceiptItemListProps {
    highlightedItemId?: string | null;
}

export const ReceiptItemList: React.FC<ReceiptItemListProps> = ({ highlightedItemId }) => {
    const { receipt } = useAppStore();

    if (!receipt) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-3 pb-4">
                {receipt.items.map(item => (
                    <ReceiptItemCard
                        key={item.id}
                        item={item}
                        isHighlighted={highlightedItemId === item.id}
                    />
                ))}
            </div>
        </div>
    );
};
