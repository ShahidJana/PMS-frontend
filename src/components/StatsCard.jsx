import React from 'react';

export default function StatsCard({ title, value, icon, color, subValue }) {
    return (
        <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-bounce-in">
            <div
                className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform animate-pulse`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl ${color} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 animate-float-slow`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-slide-in-right animate-delay-100">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2 animate-slide-in-right animate-delay-200">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {value}
                        </p>
                        {subValue && (
                            <span className="text-[10px] font-bold text-red-500 px-1.5 py-0.5 bg-red-50 dark:bg-red-950/30 rounded border border-red-100 dark:border-red-900/30 animate-pulse">
                                {subValue}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
