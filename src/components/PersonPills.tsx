import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppStore } from '../store';

export const PersonPills: React.FC = () => {
    const { people, addPerson, removePerson } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            addPerson(newName.trim());
            setNewName('');
            setIsAdding(false);
        }
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1 pb-1 snap-x snap-mandatory mt-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {people.map((person) => (
                <div
                    key={person.id}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 animate-in zoom-in"
                    style={{ backgroundColor: person.color }}
                >
                    <span>{person.name}</span>
                    <button
                        onClick={() => removePerson(person.id)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-all duration-150 active:scale-90"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}

            {isAdding ? (
                <form onSubmit={handleAdd} className="flex items-center">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Name"
                        autoFocus
                        autoCapitalize="words"
                        onBlur={() => !newName && setIsAdding(false)}
                        className="w-28 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    {people.length === 0 && <span>Add Person</span>}
                </button>
            )}
        </div>
    );
};
