import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import {
  Users,
  Briefcase,
  CheckSquare,
  Activity,
  Layout,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Shield,
  Mail,
  User as UserIcon,
  Octagon,
  Plus, // Added Plus icon
  User, // Added User icon
} from "lucide-react";
import Kanban from "../../components/Kanban";

import StatsCard from "../../components/StatsCard";
import ProjectCard from "../../components/ProjectCard";
import ProjectModal from "../../components/ProjectModal";
import ActivityLog from "../../components/ActivityLog";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projStart, setProjStart] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [projDue, setProjDue] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");

  // User Management State
  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/overview");
      setStats(res.data);
      console.log("stats Activity log", res.data?.recentActivity);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Fetch users for project assignment
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setAllUsers(res.data);
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    };
    fetchUsers();
  }, [fetchStats]);

  const [projectsKey, setProjectsKey] = useState(0);

  const handleSaveProject = async () => {
    if (!projTitle.trim()) return;
    try {
      const payload = {
        title: projTitle,
        description: projDesc,
        startDate: projStart,
        dueDate: projDue,
        owner: selectedOwner || undefined,
      };

      if (editingProject) {
        await api.patch(`/projects/${editingProject._id}`, payload);
      } else {
        await api.post("/projects", payload);
      }

      closeModal();
      setProjectsKey(prev => prev + 1);
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Failed to save project");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setProjTitle("");
    setProjDesc("");
    setProjStart(new Date().toISOString().split("T")[0]);
    setProjDue("");
    setSelectedOwner("");
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setProjTitle(project.title);
    setProjDesc(project.description || "");
    setProjStart(
      project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : ""
    );
    setProjDue(
      project.dueDate
        ? new Date(project.dueDate).toISOString().split("T")[0]
        : ""
    );
    setSelectedOwner(project.owner?._id || project.owner || "");
    setShowModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await api.delete(`/projects/${id}`);
      setProjectsKey(prev => prev + 1);
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Failed to delete project");
    }
  };

  const openUserManagement = async () => {
    setShowUserModal(true);
    setLoadingUsers(true);
    try {
      const res = await api.get("/users");
      setAllUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post(`/users/${userId}/role`, { role: newRole });
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    try {
      await api.delete(`/users/${userId}`);
      setAllUsers((prev) => prev.filter((u) => u._id !== userId));
      fetchStats();
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await api.patch(`/users/${editingUser._id}`, {
        name: userName,
        email: userEmail,
      });
      setAllUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? res.data : u))
      );
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update user");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading admin overview...
      </div>
    );
  if (!stats)
    return (
      <div className="p-8 text-center text-red-500">Error loading stats</div>
    );

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      color: "bg-blue-500",
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: <Briefcase size={24} />,
      color: "bg-emerald-500",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: <CheckSquare size={24} />,
      color: "bg-indigo-500",
    },
    {
      title: "Blocked Tasks",
      value: stats.blockedTasks,
      icon: <Octagon size={24} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden p-4 md:p-2 lg:p-4 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Admin Overview
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="btn bg-indigo-600 flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <ProjectModal
        show={showModal}
        onClose={closeModal}
        onSave={handleSaveProject}
        editingProject={editingProject}
        projTitle={projTitle}
        setProjTitle={setProjTitle}
        projDesc={projDesc}
        setProjDesc={setProjDesc}
        projStart={projStart}
        setProjStart={setProjStart}
        projDue={projDue}
        setProjDue={setProjDue}
        users={allUsers}
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        isAdmin={true}
      />

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  User Management
                </h3>
                <p className="text-sm text-slate-500">
                  Assign system roles and manage user access levels.
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsers ? (
                <div className="py-20 text-center text-slate-400 italic">
                  Synchronizing user directory...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-4 px-2">Identity</th>
                        <th className="pb-4 px-2">Access Level</th>
                        <th className="pb-4 px-2">Member Since</th>
                        <th className="pb-4 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {allUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors"
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                {editingUser?._id === u._id ? (
                                  <div className="flex flex-col gap-2 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-left-2 duration-200">
                                    <div className="relative">
                                      <UserIcon
                                        size={12}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400"
                                      />
                                      <input
                                        className="text-xs pl-8 pr-2 py-1.5 w-full bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                                        value={userName}
                                        onChange={(e) =>
                                          setUserName(e.target.value)
                                        }
                                        placeholder="Full Name"
                                      />
                                    </div>
                                    <div className="relative">
                                      <Mail
                                        size={12}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400"
                                      />
                                      <input
                                        className="text-xs pl-8 pr-2 py-1.5 w-full bg-white dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                                        value={userEmail}
                                        onChange={(e) =>
                                          setUserEmail(e.target.value)
                                        }
                                        placeholder="Email Address"
                                      />
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                      <button
                                        onClick={handleUpdateUser}
                                        className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-md font-bold uppercase transition-colors hover:bg-indigo-700 active:scale-95"
                                      >
                                        Save Changes
                                      </button>
                                      <button
                                        onClick={() => setEditingUser(null)}
                                        className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md font-bold uppercase transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm font-bold text-slate-700 dark:text-white leading-none">
                                      {u.name}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {u.email}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <select
                              className="text-xs bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              value={u.role}
                              onChange={(e) =>
                                handleRoleChange(u._id, e.target.value)
                              }
                            >
                              <option value="member">Member</option>
                              <option value="pm">Project Manager</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </td>
                          <td className="py-4 px-2 text-xs text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                title="Edit User"
                              >
                                <Edit2 size={14} />
                              </button>
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="btn bg-indigo-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      {/* Projects List Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 tracking-tight">
          <Layout size={20} className="text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Project Portfolio
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.projects?.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteProject}
            />
          ))}
          {(!stats.projects || stats.projects.length === 0) && (
            <div className="col-span-full py-12 text-center card bg-slate-50 dark:bg-slate-900/30 border-dashed">
              <p className="text-slate-400 italic">
                No projects found. Create one to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Management Console */}
      <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
        <div>
          <div className="flex items-center gap-2 tracking-tight mb-1">
            <Layout size={20} className="text-emerald-400" />
            <h3 className="text-xl font-bold text-white">
              User Management Console
            </h3>
          </div>
          <p className="text-indigo-100 text-sm">
            Manage system-wide permissions across the platform.
          </p>
        </div>
        <button
          onClick={openUserManagement}
          className="w-full sm:w-auto bg-black/70 hover:bg-white/20 px-6 py-3 rounded-xl text-center backdrop-blur-sm transition-colors border border-white/10 shrink-0"
        >
          <span className="text-sm font-bold text-white">Manage Users Directory</span>
        </button>
      </div>

      {/* Kanban Board and Activity Log */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-2">
        {/* Global Kanban for Admins */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <Kanban key={projectsKey} editable={true} onTaskUpdate={fetchStats} />
        </div>
        <ActivityLog
          activities={stats.recentActivity}
          title="System Activity"
        />
      </div>
    </div>
  );
}
