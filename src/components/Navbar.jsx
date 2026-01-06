import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DarkToggle from "./DarkToggle";
import api from "../utils/api";
import { LayoutDashboard, Kanban, BarChart3, ShieldCheck, LogOut, User, Bell, AlertTriangle, Calendar, RotateCw } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
      : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
    }`;

  const NotificationIcon = ({ type, urgent }) => {
    if (urgent) return <AlertTriangle size={16} className="text-red-500 animate-pulse" />;
    if (type === 'project-alert') return <ShieldCheck size={16} className="text-purple-500" />;
    return <Calendar size={16} className="text-indigo-500" />;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 animate-slide-in-up">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 mr-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 animate-pulse-glow">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-lg font-black tracking-tighter dark:text-white animate-slide-in-right animate-delay-100">
              PROJECT
              <span className="block text-indigo-600 animate-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Management System</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 animate-slide-in-right animate-delay-200">
            {user && user.role === "member" && (
              <>
                <NavLink to="/team" className={navLinkClass}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>
                <NavLink to="/kanban" className={navLinkClass}>
                  <Kanban size={18} />
                  Kanban
                </NavLink>
              </>
            )}
            {user && user.role === "pm" && (
              <>
                <NavLink to="/pm" className={navLinkClass}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>
              </>
            )}
            {user && user.role === "admin" && (
              <>
                <NavLink to="/admin" className={navLinkClass}>
                  <ShieldCheck size={18} />
                  Admin
                </NavLink>
                <NavLink to="/analytics" className={navLinkClass}>
                  <BarChart3 size={18} />
                  Analytics
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6 animate-slide-in-left animate-delay-200">
          <DarkToggle />

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:scale-110 hover:border-indigo-500 transition-all duration-300 relative"
                >
                  <Bell size={20} />
                  {notifications.some(n => !n.read) ? (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
                  ) : notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell size={16} className="text-indigo-600" />
                        Notifications
                      </h3>
                      <button onClick={fetchNotifications} className="text-xs text-indigo-600 hover:underline">
                        <RotateCw size={16} />
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 group">
                              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.urgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                <NotificationIcon type={notif.type} urgent={notif.urgent} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <span className="opacity-75">{new Date(notif.timestamp).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <Bell size={32} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No new alerts</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex flex-col items-center animate-bounce-in animate-delay-300">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{user.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded cursor-default animate-pulse">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:scale-110 hover:border-indigo-500 transition-all duration-300 animate-bounce-in animate-delay-400">
                <User size={20} />
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95 hover:rotate-12 duration-300 animate-bounce-in animate-delay-500"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {location.pathname === '/login' ? (
                <>
                  <Link to="/register" className="btn animate-bounce-in">
                    Register                  </Link>
                </>
              ) : location.pathname === '/register' ? (
                <>
                  <Link to="/login" className="btn animate-bounce-in">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all hover:scale-105 animate-slide-in-left animate-delay-300">
                    Login
                  </Link>
                  <Link to="/register" className="btn animate-bounce-in animate-delay-400">
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
