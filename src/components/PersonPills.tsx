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
        <div className="flex flex-wrap gap-2 mb-6">
            {people.map((person) => (
                <div
                    key={person.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm animate-in zoom-in duration-200"
                    style={{ backgroundColor: person.color }}
                >
                    <span>{person.name}</span>
                    <button
                        onClick={() => removePerson(person.id)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
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
                        onBlur={() => !newName && setIsAdding(false)}
                        className="w-28 px-4 py-2 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Person
                </button>
            )}
        </div>
    );
};
