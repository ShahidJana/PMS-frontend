import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, text = "Loading..." }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                </div>
                <p className="mt-4 text-emerald-600 font-medium animate-pulse">{text}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm text-slate-400 font-medium animate-pulse">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
