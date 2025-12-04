import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { X, Users, Plus, Edit2, Trash2, Star, Check } from 'lucide-react';
import type { SavedGroup } from '../types';

interface GroupsModalProps {
    onClose: () => void;
}

export const GroupsModal: React.FC<GroupsModalProps> = ({ onClose }) => {
    const { savedGroups, people, userPreferences, createGroup, loadGroup, updateGroupDetails, deleteGroupById, setDefaultGroup } = useAppStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        await createGroup(newGroupName.trim());
        setNewGroupName('');
        setIsCreating(false);
    };

    const handleUpdateGroup = async (groupId: string) => {
        if (!editingGroupName.trim()) return;

        await updateGroupDetails(groupId, editingGroupName.trim());
        setEditingGroupId(null);
        setEditingGroupName('');
    };

    const handleDeleteGroup = async (groupId: string, groupName: string) => {
        if (confirm(`Delete group "${groupName}"?`)) {
            await deleteGroupById(groupId);
        }
    };

    const handleToggleDefault = async (groupId: string) => {
        if (userPreferences?.defaultGroupId === groupId) {
            await setDefaultGroup(null);
        } else {
            await setDefaultGroup(groupId);
        }
    };

    const handleLoadGroup = (group: SavedGroup) => {
        loadGroup(group);
        onClose();
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gray-50 w-full h-[90dvh] sm:h-auto sm:max-h-[80dvh] sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="w-8" />
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Saved Groups</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Create New Group */}
                    {people.length > 0 && (
                        <div className="space-y-2">
                            <p className="px-1 text-[10px] uppercase tracking-wider font-bold text-gray-400">Create New</p>
                            {isCreating ? (
                                <form onSubmit={handleCreateGroup} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Group name (e.g., Roommates)"
                                        maxLength={50}
                                        autoFocus
                                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            type="submit"
                                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
                                        >
                                            Save Group
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreating(false);
                                                setNewGroupName('');
                                            }}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">People in this group:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {people.map(person => (
                                                <span
                                                    key={person.id}
                                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: person.color }}
                                                >
                                                    {person.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-center gap-2 group active:scale-[0.99] transition-all"
                                >
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                    <span className="font-bold text-gray-600 group-hover:text-blue-600">Save Current People as Group</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Saved Groups List */}
                    {savedGroups.length > 0 && (
                        <div className="space-y-2">
                            <p className="px-1 text-[10px] uppercase tracking-wider font-bold text-gray-400">Your Groups</p>
                            {savedGroups.map(group => (
                                <div
                                    key={group.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                                >
                                    {editingGroupId === group.id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editingGroupName}
                                                onChange={(e) => setEditingGroupName(e.target.value)}
                                                maxLength={50}
                                                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateGroup(group.id)}
                                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingGroupId(null);
                                                        setEditingGroupName('');
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <button
                                                        onClick={() => handleToggleDefault(group.id)}
                                                        className={`p-1 rounded-full transition-all ${userPreferences?.defaultGroupId === group.id
                                                            ? 'text-yellow-500 hover:text-yellow-600'
                                                            : 'text-gray-300 hover:text-yellow-500'
                                                            }`}
                                                        title={userPreferences?.defaultGroupId === group.id ? 'Remove as default' : 'Set as default'}
                                                    >
                                                        <Star className="w-4 h-4" fill={userPreferences?.defaultGroupId === group.id ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                                                    {userPreferences?.defaultGroupId === group.id && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">DEFAULT</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingGroupId(group.id);
                                                            setEditingGroupName(group.name);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit name"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGroup(group.id, group.name)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete group"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {group.people.map(person => (
                                                    <span
                                                        key={person.id}
                                                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                                        style={{ backgroundColor: person.color }}
                                                    >
                                                        {person.name}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handleLoadGroup(group)}
                                                className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Users className="w-4 h-4" />
                                                Load Group
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {savedGroups.length === 0 && people.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Groups Yet</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Add people to a bill, then save them as a group for quick access later.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};
