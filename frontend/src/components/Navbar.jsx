import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    return (
        <header className="flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-white">TaskManager</h1>
                <nav className="flex space-x-4">
                    <Link 
                        to="/dashboard" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Tasks
                    </Link>
                    <Link 
                        to="/projects" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/projects' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Projects
                    </Link>
                </nav>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-slate-300">Welcome, {user?.name}</span>
                <button onClick={logout} className="flex items-center px-3 py-2 text-sm text-red-400 bg-red-400/10 rounded hover:bg-red-400/20">
                    <LogOut size={16} className="mr-2" /> Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
