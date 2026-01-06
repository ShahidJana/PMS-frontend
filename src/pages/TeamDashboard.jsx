import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Briefcase, CheckCircle2, Layout } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';

export default function TeamDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/overview')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading your workspace..." />;
  if (!stats) return <div className="p-8 text-center text-red-500">Error loading dashboard</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Workspace Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome, {user?.name}. Here is your current project status.</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CheckCircle2 size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-6">Overall Task Completion</h3>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-6xl font-black">{stats.overallProgress}%</span>
            <span className="text-indigo-100 mb-2 font-medium">Progress achieved</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-2">
            <div
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
          <p className="text-indigo-100 text-sm">
            {stats.completedTasks} tasks completed out of {stats.assignedTasks + stats.completedTasks} total assignments
          </p>
        </div>
      </div>

      {/* Main Content: Tasks and Projects */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Layout size={20} className="text-indigo-500" />
          Assigned Tasks
        </h3>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Task Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.upcomingTasks?.map((task, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-100">{task.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Briefcase size={14} className="text-indigo-500" />
                        <span className="text-sm font-medium">{task.project?.title || 'No Project'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar size={14} className="text-orange-500" />
                        <span className="text-sm">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date Set'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        task.status === 'blocked' ? 'bg-red-100 text-red-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats.upcomingTasks || stats.upcomingTasks.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                      No active tasks assigned matching your profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
