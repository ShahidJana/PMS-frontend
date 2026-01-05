import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import Kanban from "../../components/Kanban";
import { Layers, CheckCircle, Clock, Activity, Octagon } from "lucide-react";

import StatsCard from "../../components/StatsCard";
import ProjectModal from "../../components/ProjectModal";
import ActivityLog from "../../components/ActivityLog";

export default function PMDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");

  const [projectsKey, setProjectsKey] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/overview");
      setStats(res.data);
      console.log('stats', res.data)
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateProject = async () => {
    if (!projTitle.trim()) return;
    try {
      await api.post("/projects", { title: projTitle, description: projDesc });
      setShowModal(false);
      setProjTitle("");
      setProjDesc("");
      setProjectsKey(prev => prev + 1);
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Failed to create project");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Syncing project data...
      </div>
    );
  if (!stats)
    return <div className="p-8 text-center text-red-500">Loading data...</div>;

  const cards = [
    {
      title: "My Projects",
      value: stats.ownedProjects,
      icon: <Layers size={22} />,
      color: "bg-indigo-500",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: <Clock size={22} />,
      color: "bg-orange-500",
      subValue: stats.blockedTasks > 0 ? `${stats.blockedTasks} Blocked` : null
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: <CheckCircle size={22} />,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Project Manager
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your projects and track team performance
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn self-start">
          New Project
        </button>
      </div>

      <ProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateProject}
        projTitle={projTitle}
        setProjTitle={setProjTitle}
        projDesc={projDesc}
        setProjDesc={setProjDesc}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-2">
        {/* Kanban Board */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <Kanban key={projectsKey} editable={true} onTaskUpdate={fetchStats} />
        </div>

        {/* Project Logs */}
        <ActivityLog
          activities={stats.recentActivity}
          title="Project Logs"
          iconColor="text-orange-500"
        />
      </div>

    </div>
  );
}
