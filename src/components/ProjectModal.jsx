import React from 'react';

export default function ProjectModal({ show, onClose, onSave, editingProject, projTitle, setProjTitle, projDesc, setProjDesc, projStart, setProjStart, projDue, setProjDue }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    {editingProject ? "Edit Project" : "New Project"}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold mb-1 block text-slate-600 dark:text-slate-400">
                            Project Title
                        </label>
                        <input
                            className="form-input"
                            placeholder="e.g. Q1 Roadmap"
                            value={projTitle}
                            onChange={(e) => setProjTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">
                            Description
                        </label>
                        <textarea
                            className="form-input min-h-[80px]"
                            placeholder="Project description..."
                            value={projDesc}
                            onChange={(e) => setProjDesc(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-1 block">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className="form-input"
                                value={projStart}
                                onChange={(e) => setProjStart(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-1 block">
                                Due Date
                            </label>
                            <input
                                type="date"
                                className="form-input"
                                value={projDue}
                                onChange={(e) => setProjDue(e.target.value)}
                            />
                        </div>
                    </div>


                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="btn bg-indigo-600 shadow-lg shadow-indigo-500/20"
                        >
                            {editingProject ? "Update Project" : "Create Project"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
