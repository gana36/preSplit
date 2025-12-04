import React, { useState } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { useAppStore } from '../store';
import { GroupsModal } from './GroupsModal';

export const PersonPills: React.FC = () => {
    const { people, addPerson, removePerson, recentNames } = useAppStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [showGroupsModal, setShowGroupsModal] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            addPerson(newName.trim());
            setNewName('');
            setIsAdding(false);
        }
    };

    const handleQuickAdd = (name: string) => {
        addPerson(name);
        setNewName('');
    };

    // Filter out names that are already added
    const availableRecentNames = recentNames.filter(
        name => !people.some(p => p.name.toLowerCase() === name.toLowerCase())
    );

    return (
        <>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-0.5 pb-0.5 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {people.map((person) => (
                    <div
                        key={person.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 animate-in zoom-in"
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

                {/* Load Group Button */}
                <button
                    onClick={() => setShowGroupsModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 active:scale-95 transition-all duration-200"
                    title="Load saved group"
                >
                    <Users className="w-4 h-4" />
                </button>

                {isAdding ? (
                    <div className="flex flex-col gap-2">
                        <form onSubmit={handleAdd} className="flex items-center">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Name"
                                autoFocus
                                autoCapitalize="words"
                                onBlur={() => !newName && setIsAdding(false)}
                                className="w-24 px-2.5 py-1 rounded-full text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            />
                        </form>

                        {/* Quick suggestions */}
                        {availableRecentNames.length > 0 && (
                            <div className="absolute mt-10 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 max-w-xs">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-2 mb-1">Recent</p>
                                <div className="flex flex-wrap gap-1">
                                    {availableRecentNames.slice(0, 8).map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => handleQuickAdd(name)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-xs font-medium transition-all active:scale-95"
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        {people.length === 0 && <span>Add Person</span>}
                    </button>
                )}
            </div>

            {showGroupsModal && (
                <GroupsModal onClose={() => setShowGroupsModal(false)} />
            )}
        </>
    );
};
