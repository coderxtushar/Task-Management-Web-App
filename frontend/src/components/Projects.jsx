import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { Plus, Trash2, UserPlus, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [memberEmails, setMemberEmails] = useState({});
    const [error, setError] = useState({});

    const fetchProjects = async () => {
        try {
            const res = await API.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            setIsCreating(true);
            const res = await API.post('/projects', { name: newProjectName });
            setProjects([res.data, ...projects]);
            setNewProjectName('');
            toast.success('Project created successfully!');
        } catch (err) {
            console.error('Failed to create project', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddMember = async (projectId, e) => {
        e.preventDefault();
        const email = memberEmails[projectId];
        if (!email) return;

        try {
            const res = await API.post(`/projects/${projectId}/members`, { email });
            setProjects(projects.map(p => p._id === projectId ? res.data : p));
            setMemberEmails({ ...memberEmails, [projectId]: '' });
            setError({ ...error, [projectId]: null });
            toast.success('Member added successfully!');
        } catch (err) {
            setError({ ...error, [projectId]: err.response?.data?.msg || 'Failed to add member' });
        }
    };

    const handleRemoveMember = async (projectId, userId) => {
        try {
            const res = await API.delete(`/projects/${projectId}/members/${userId}`);
            setProjects(projects.map(p => p._id === projectId ? res.data : p));
            toast.success('Member removed');
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? All tasks inside it will be permanently lost.')) return;
        try {
            await API.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p._id !== projectId));
            toast.success('Project deleted successfully');
        } catch (err) {
            console.error('Failed to delete project', err);
            toast.error('Failed to delete project');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <main className="max-w-5xl p-6 mx-auto">
                {/* Create Project Form */}
                {user?.role === 'admin' && (
                    <form onSubmit={handleCreateProject} className="p-6 mb-8 bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
                        <h2 className="text-lg font-semibold text-white whitespace-nowrap">Create Project</h2>
                        <input
                            type="text"
                            placeholder="Project Name"
                            required
                            className="flex-1 w-full px-4 py-2 text-slate-900 bg-slate-100 border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isCreating}
                            className={`flex items-center justify-center w-full md:w-auto px-6 py-2 text-white bg-indigo-600 rounded ${isCreating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                        >
                            <Plus size={18} className="mr-2" /> {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </form>
                )}
                {/* Projects List */}
                <div className="space-y-6">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-slate-800 border border-slate-700 rounded-xl">
                            You are not part of any projects yet. Create one!
                        </div>
                    ) : (
                        projects.map(project => {
                            const isAdmin = user?.role === 'admin';

                            return (
                                <div key={project._id} className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center">
                                                {project.name}
                                                {isAdmin && <span className="ml-3 px-2 py-1 text-xs font-semibold text-indigo-200 bg-indigo-600/30 rounded-full">Admin</span>}
                                            </h3>
                                            <div className="text-sm text-slate-400 mt-1">Created by: {project.admin.name}</div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    className="flex items-center px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-sm font-medium rounded-lg transition-colors border border-red-600/30"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <Link
                                                to={`/projects/${project._id}/dashboard`}
                                                className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <PieChart size={16} className="mr-2" /> Dashboard
                                            </Link>
                                            <Link
                                                to={`/projects/${project._id}`}
                                                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                View Tasks <ArrowRight size={16} className="ml-2" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-slate-700 pt-4">
                                        <h4 className="text-sm font-semibold text-slate-300 flex items-center mb-3">
                                            <Users size={16} className="mr-2" /> Members ({project.members.length + 1})
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <div className="px-3 py-1 bg-slate-700 text-sm rounded-full text-slate-200 flex items-center">
                                                {project.admin.name} (Admin)
                                            </div>
                                            {project.members.map(member => (
                                                <div key={member._id} className="px-3 py-1 bg-slate-700 text-sm rounded-full text-slate-200 flex items-center">
                                                    {member.name}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleRemoveMember(project._id, member._id)}
                                                            className="ml-2 text-red-400 hover:text-red-300 focus:outline-none"
                                                            title="Remove member"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Admin UI: Add Member */}
                                        {isAdmin && (
                                            <>
                                                <form onSubmit={(e) => handleAddMember(project._id, e)} className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                                    <div className="flex-1">
                                                        <input
                                                            type="email"
                                                            placeholder="Add user by email..."
                                                            className="w-full px-3 py-1.5 text-sm text-slate-900 bg-slate-100 border border-slate-600 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={memberEmails[project._id] || ''}
                                                            onChange={(e) => setMemberEmails({ ...memberEmails, [project._id]: e.target.value })}
                                                        />
                                                        {error[project._id] && <p className="text-xs text-red-400 mt-1">{error[project._id]}</p>}
                                                    </div>
                                                    <button type="submit" className="flex items-center justify-center px-4 py-1.5 text-sm text-white bg-slate-600 rounded hover:bg-slate-500">
                                                        <UserPlus size={16} className="mr-2" /> Add
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default Projects;
