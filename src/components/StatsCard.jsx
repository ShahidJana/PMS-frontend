import React from 'react';

export default function StatsCard({ title, value, icon, color, subValue }) {
    return (
        <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}
            />
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                            {value}
                        </p>
                        {subValue && (
                            <span className="text-[10px] font-bold text-red-500 px-1.5 py-0.5 bg-red-50 dark:bg-red-950/30 rounded border border-red-100 dark:border-red-900/30">
                                {subValue}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
