import React from 'react';
import { useAppStore } from '../store';
import type { ReceiptItem } from '../types';
import { Check } from 'lucide-react';
import clsx from 'clsx';

export const ReceiptItemList: React.FC = () => {
    const { receipt, people, toggleAssignment } = useAppStore();
    const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);

    if (!receipt) return null;

    // Helper to get person object by ID
    const getPerson = (id: string) => people.find(p => p.id === id);

    const handlePersonToggle = (personId: string) => {
        setSelectedPeople(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    const handleItemClick = (item: ReceiptItem) => {
        // If people are selected in the "toolbar", assign them to this item
        if (selectedPeople.length > 0) {
            selectedPeople.forEach(personId => {
                // Toggle logic: if already assigned, remove. If not, add.
                // But for multi-select toolbar, usually we want to ADD.
                // Let's stick to the simple toggle logic per person for now.
                toggleAssignment(item.id, personId);
            });
            // Optional: clear selection after assignment? 
            // No, keep it for rapid assignment of multiple items.
        }
    };

    return (
        <div className="space-y-4 pb-24">
            {/* Sticky Person Toolbar for Quick Assignment */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 py-2 border-b border-gray-100 -mx-4 px-4 overflow-x-auto flex gap-2 no-scrollbar">
                {people.length === 0 && (
                    <div className="text-sm text-gray-500 italic">Add people above to start assigning</div>
                )}
                {people.map(person => (
                    <button
                        key={person.id}
                        onClick={() => handlePersonToggle(person.id)}
                        className={clsx(
                            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2",
                            selectedPeople.includes(person.id)
                                ? "border-blue-500 shadow-md transform scale-105"
                                : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        style={selectedPeople.includes(person.id) ? { backgroundColor: person.color, borderColor: person.color, color: 'white' } : {}}
                    >
                        {selectedPeople.includes(person.id) && <Check className="w-3 h-3" />}
                        {person.name}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {receipt.items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="flex flex-col p-3 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-[0.99] transition-transform cursor-pointer hover:border-blue-200"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{item.description}</span>
                            <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                            {item.assignedTo.length === 0 ? (
                                <span className="text-xs text-gray-400">Tap to assign selected</span>
                            ) : (
                                item.assignedTo.map(personId => {
                                    const person = getPerson(personId);
                                    if (!person) return null;
                                    return (
                                        <div
                                            key={person.id}
                                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                            style={{ backgroundColor: person.color }}
                                            title={person.name}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
