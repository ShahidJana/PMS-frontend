import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

export default function ActivityLog({ activities, title = "Activity Log", icon: DisplayIcon = ActivityIcon, iconColor = "text-indigo-500" }) {
    return (
        <div className="card h-[400px] sm:h-[500px] md:h-full lg:h-[600px] xl:h-[700px] flex flex-col p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-6 tracking-tight">
                <DisplayIcon size={18} className={`${iconColor} md:w-5 md:h-5`} />
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
                    {title}
                </h3>
            </div>
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
                {activities?.map((act) => (
                    <div
                        key={act._id}
                        className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 group"
                    >
                        <div className={`w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform`} />
                        <div className="flex-1">
                            <p className="text-slate-700 dark:text-slate-200 text-xs md:text-sm leading-relaxed flex flex-wrap items-center">
                                <span className={`font-black ${act.actor?.role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' :
                                    act.actor?.role === 'pm' ? 'text-emerald-600 dark:text-emerald-400' :
                                        'text-slate-900 dark:text-white'
                                    }`}>
                                    {act.actor?.name || 'System'}
                                </span>
                                <span className="mx-1 text-slate-500 lowercase">
                                    {act.action.replace("_", " ")}:
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-100 italic">
                                    "{act.meta?.title || act.resourceType || 'something'}"
                                </span>
                                {act.meta?.status && (
                                    <span className={`ml-2 my-0.5 text-[9px] md:text-[10px] font-bold uppercase py-0.5 px-2 rounded-lg border shadow-sm ${act.meta.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        act.meta.status === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            act.meta.status === 'blocked' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                        {act.meta.status.replace("-", " ")}
                                    </span>
                                )}
                                {act.meta?.assigneeName && (
                                    <span className="ml-2 my-0.5 text-[9px] md:text-[10px] font-bold uppercase py-0.5 px-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-sm">
                                        Assigned to: {act.meta.assigneeName}
                                    </span>
                                )}
                                {act.meta?.projectTitle && (
                                    <span className="ml-2 my-0.5 text-[9px] md:text-[10px] font-black uppercase py-0.5 px-2 bg-indigo-50 dark:bg-slate-800 text-indigo-500 rounded-full border border-indigo-100 dark:border-slate-700">
                                        {act.meta.projectTitle}
                                    </span>
                                )}
                            </p>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                {new Date(act.createdAt).toLocaleString(undefined, {
                                    year: 'numeric',
                                    month: 'numeric',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                {(!activities || activities.length === 0) && (
                    <div className="py-8 md:py-12 text-center text-slate-400 italic bg-slate-50/30 dark:bg-slate-900/30 rounded-2xl md:rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        No recent activity recorded.
                    </div>
                )}
            </div>
        </div>

    );
}
