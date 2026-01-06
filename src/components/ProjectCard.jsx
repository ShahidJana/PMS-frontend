import React from 'react';
import { Clock, Edit2, Trash2, ChevronRight, User, Users, CheckCircle2 } from 'lucide-react';

export default function ProjectCard({ project, onEdit, onDelete, onStatusToggle }) {
    const isCompleted = project.status === 'completed';

    return (
        <div className={`card hover:border-indigo-500/50 transition-all group animate-slide-in-up ${isCompleted ? 'border-emerald-500/20 bg-emerald-50/10' : ''}`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate flex-1 pr-2">
                        {project.title}
                    </h4>
                    {isCompleted ? (
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-bounce-in">
                            <CheckCircle2 size={12} />
                            Completed
                        </span>
                    ) : (
                        <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-bounce-in">
                            <Clock size={12} />
                            In Progress ({project.progress}%)
                        </span>
                    )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-8 animate-slide-in-right animate-delay-100">
                    {project.description || "No description provided for this project."}
                </p>

                <div className="flex items-center gap-4 mb-6 animate-slide-in-right animate-delay-200">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                        <Clock size={14} className="text-indigo-600 animate-pulse" />
                        <span>
                            <span className="text-indigo-600 dark:text-indigo-400">Start Date: </span>
                            {project.startDate
                                ? new Date(project.startDate).toLocaleDateString()
                                : "Set Start"}{" "}
                            -{" "}
                            <span className="text-indigo-600 dark:text-indigo-400">Due Date: </span>
                            {project.dueDate
                                ? new Date(project.dueDate).toLocaleDateString()
                                : "Set Due"}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase animate-slide-in-left animate-delay-300">
                        <span>Progress</span>
                        <span>
                            {project.completedTasks} / {project.totalTasks} Tasks
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden relative animate-slide-in-left animate-delay-300">
                        <div
                            className={`h-full transition-all duration-500 relative overflow-hidden animate-gradient ${isCompleted ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'}`}
                            style={{ width: `${project.progress}%` }}
                        >
                            <div className="absolute inset-0 animate-shimmer"></div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-4 p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/50 animate-slide-in-up animate-delay-400">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-800 transition-transform group-hover:scale-110 duration-300">
                                {project.owner?.name?.charAt(0) || "U"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">
                                    Project Manager
                                </p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex items-center gap-1">
                                    <User size={12} className="text-indigo-500" />
                                    {project.owner?.name || "Unassigned"}
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-200/50 dark:bg-slate-700/50" />

                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {project.assignees?.slice(0, 4).map((u, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-transform hover:scale-125 hover:z-10 duration-200"
                                        title={u.name}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        {u.name.charAt(0)}
                                    </div>
                                ))}
                                {project.assignees?.length > 4 && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/40 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-indigo-500 transition-transform hover:scale-125 hover:z-10 duration-200">
                                        +{project.assignees.length - 4}
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                <Users size={12} />
                                {project.assignees?.length || 0} Assigned Members
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 animate-slide-in-up animate-delay-500 justify-between">

                        <div>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(project)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110 active:scale-95"
                                    title="Edit Project"
                                >
                                    <Edit2 size={20} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(project._id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110 active:scale-95"
                                    title="Delete Project"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                        {onStatusToggle && (
                            <button
                                onClick={() => onStatusToggle(project)}
                                className={`p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${isCompleted
                                    ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                    : "text-indigo-600 hover:text-indigo-600 hover:bg-indigo-50"
                                    }`}
                                title={isCompleted ? "Mark as Completed" : "Mark as Active"}
                            >
                                <span className="flex items-center gap-2 font-bold">
                                    {isCompleted ? (
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            Completed <CheckCircle2 size={20} className="fill-current" />
                                        </span>
                                    ) : (
                                        <span className="text-indigo-600 flex items-center gap-1">
                                            Active <CheckCircle2 size={20} />
                                        </span>
                                    )}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
