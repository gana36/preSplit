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
        price: item.price.toString(),
        discount: item.discount ? item.discount.toString() : '',
        originalPrice: item.originalPrice ? item.originalPrice.toString() : item.price.toString()
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
            className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm transition-all duration-500 group relative ${isEditing
                ? 'ring-2 ring-blue-400 border-blue-400 z-10'
                : isHighlighted
                    ? 'ring-2 ring-sky-400 border-sky-400 z-10'
                    : 'border-gray-100 hover:border-blue-200'
                }`}
        >
            {!isEditing && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                        ${isEditing ? currentFinal.toFixed(2) : item.price.toFixed(2)}
                    </span>
                    {isEditing && (
                        <button
                            onClick={handleSave}
                            className="mt-1 p-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
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
