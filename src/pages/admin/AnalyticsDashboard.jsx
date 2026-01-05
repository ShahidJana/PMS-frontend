import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await api.get('/analytics');
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-4">Loading analytics...</div>;
    if (!data) return <div className="p-4">Failed to load data</div>;

    console.log("Data Analytics", data);

    const { tasksPerUser, projectProgress, weeklyPerformance } = data;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Analytics Dashboard</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Tasks Completed Per User */}
                <div className="card h-96">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Tasks Completed per User</h3>
                    {tasksPerUser.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tasksPerUser}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <ReTooltip />
                                <Legend />
                                <Bar dataKey="count" name="Tasks Done" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-500">No data available</p>}
                </div>

                {/* Project Progress */}
                <div className="card h-96">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Project Progress (%)</h3>
                    {projectProgress.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectProgress} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="title" type="category" width={100} />
                                <ReTooltip />
                                <Legend />
                                <Bar dataKey="progress" name="Progress %" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-500">No data available</p>}
                </div>

                {/* Weekly Performance */}
                <div className="card h-96 lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">Weekly Performance (Last 8 Weeks)</h3>
                    {weeklyPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis allowDecimals={false} />
                                <ReTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="completed" name="Tasks Completed" stroke="#ff7300" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-500">No data available</p>}
                </div>

            </div>
        </div>
    );
}
