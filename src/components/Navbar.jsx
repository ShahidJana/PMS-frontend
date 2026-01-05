import React from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DarkToggle from "./DarkToggle";
import { LayoutDashboard, Kanban, BarChart3, ShieldCheck, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
      : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 mr-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-300">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-lg font-black tracking-tighter dark:text-white">
              PROJECT
              <span className="block text-indigo-600">Management System</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
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

        <div className="flex items-center gap-6">
          <DarkToggle />

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{user.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded cursor-default">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <User size={20} />
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* On mobile (smaller than md): show only Get Started on login page, only Login on register page */}
              {/* On desktop (md and larger): show both buttons */}
              {location.pathname === '/login' ? (
                <>
                  <Link to="/register" className="btn">
                    Register                  </Link>
                </>
              ) : location.pathname === '/register' ? (
                <>
                  <Link to="/login" className="btn">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn">
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
