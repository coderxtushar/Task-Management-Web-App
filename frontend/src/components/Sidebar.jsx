import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, Settings, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        { name: 'My Tasks', path: '/dashboard', icon: <CheckSquare size={20} /> },
        { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    ];

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between fixed left-0 top-0 text-slate-300">
            <div>
                <div className="h-16 flex items-center px-6 border-b border-slate-800 mb-6">
                    <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                        <LayoutDashboard className="text-indigo-500" />
                        <span>TaskManager</span>
                    </div>
                </div>

                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Menu
                </div>
                <nav className="px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group ${
                                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-bg"
                                        className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className={`relative z-10 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {item.icon}
                                </span>
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
                
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut size={20} className="text-slate-500 group-hover:text-red-400" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
