import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import {
  Users,
  FolderTree,
  ClipboardList,
  ClipboardPenLine,
  ClipboardCheck,
  Layout,
  Edit2,
  Trash2,
  X,
  Mail,
  User as UserIcon,
  Plus,
  User,
  Ban,
  Lock,
  Unlock,
  SquarePen
} from "lucide-react";
import Kanban from "../../components/Kanban";

import StatsCard from "../../components/StatsCard";
import ProjectCard from "../../components/ProjectCard";
import ProjectModal from "../../components/ProjectModal";
import ActivityLog from "../../components/ActivityLog";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from 'react-hot-toast';

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
      console.log("stats AdminDashboard", res.data);
      // console.log("stats Activity log", res.data?.recentActivity);
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
      setProjectsKey(prev => prev + 1);
      fetchStats();
      toast.success(editingProject ? 'Project updated successfully' : 'Project created successfully');
    } catch (e) {
      console.error(e);
      toast.error("Failed to save project");
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
      toast.success('Project deleted successfully');
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete project");
    }
  };

  const handleToggleStatus = async (project) => {
    // Validation: Cannot complete if tasks are pending
    if (project.status !== 'completed' && project.totalTasks > 0 && project.progress < 100) {
      toast.error("Cannot mark as completed: Project has pending tasks.");
      return;
    }

    const newStatus = project.status === 'completed' ? 'active' : 'completed';
    try {
      await api.patch(`/projects/${project._id}`, { status: newStatus });
      setProjectsKey(prev => prev + 1);
      fetchStats();
      toast.success(newStatus === 'completed' ? 'Project marked as completed' : 'Project reactivated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
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
      toast.success(`User role updated to ${newRole}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update role");
    }
  };

  const handleToggleBlock = async (user) => {
    if (user.role === 'admin') {
      toast.error("Administrators cannot be blocked.");
      return;
    }
    const action = user.blocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.post(`/users/${user._id}/block`, { blocked: !user.blocked });
      setAllUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, blocked: !user.blocked } : u))
      );
      toast.success(`User ${user.blocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${action} user`);
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
      toast.success('User deleted successfully');
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete user");
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
      toast.success('User updated successfully');
    } catch (e) {
      console.error(e);
      toast.error("Failed to update user");
    }
  };

  if (loading)
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  if (!stats)
    return (
      <div className="p-8 text-center text-red-500">Error loading stats</div>
    );

  const cards = [
    {
      title: "Users",
      value: stats.totalUsers != null
        ? `${stats.totalUsers < 10 ? '0' : ''}${stats.totalUsers}`
        : '0',
      icon: <Users size={24} strokeWidth={2.5} />,
      color: "bg-blue-500",
    },
    {
      title: "Projects",
      value: stats.totalProjects != null
        ? `${stats.totalProjects < 10 ? '0' : ''}${stats.totalProjects}`
        : '0',
      icon: <FolderTree size={24} strokeWidth={2.5} />,
      color: "bg-emerald-500",
    },
    {
      title: "Tasks",
      value: stats.totalTasks != null
        ? `${stats.totalTasks < 10 ? '0' : ''}${stats.totalTasks}`
        : '0',
      icon: <ClipboardList size={24} strokeWidth={2.5} />,
      color: "bg-indigo-500",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks != null
        ? `${stats.activeTasks < 10 ? '0' : ''}${stats.activeTasks}`
        : '0',
      icon: <ClipboardPenLine size={24} strokeWidth={2.5} />,
      color: "bg-orange-500",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks != null
        ? `${stats.completedTasks < 10 ? '0' : ''}${stats.completedTasks}`
        : '0',
      icon: <ClipboardCheck size={24} strokeWidth={2.5} />,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="w-full min-h-screen overflow-x-hidden p-4 md:p-2 lg:p-4 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Admin Dashboard        </h2>
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
                <X size={20} className="text-slate-400 hover:text-red-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsers ? (
                <div className="py-20 flex justify-center">
                  <LoadingSpinner text="Synchronizing user directory..." />
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
                          className={`group hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${u.blocked ? 'opacity-60 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.blocked ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                                {u.blocked ? <Ban size={14} /> : u.name.charAt(0)}
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
                                    <p className="text-sm font-bold text-slate-700 dark:text-white leading-none flex items-center gap-2">
                                      {u.name}
                                      {u.blocked && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Blocked</span>}
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
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleToggleBlock(u)}
                                  className={`p-1.5 rounded-lg transition-all ${u.blocked ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                                  title={u.blocked ? "Unblock User" : "Block User"}
                                >
                                  {u.blocked ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>
                              )}
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                title="Edit User"
                              >
                                <SquarePen size={14} />
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      {/* Projects List Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 tracking-tight">
          <Layout size={20} strokeWidth={2.5} className="text-emerald-500" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Project Workspace
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.projects?.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditClick}
              onDelete={handleDeleteProject}
              onStatusToggle={handleToggleStatus}
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
      <div className="card bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
        <div>
          <div className="flex items-center gap-2 tracking-tight mb-1">
            <Users size={20} strokeWidth={2.5} className="text-emerald-400" />
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
