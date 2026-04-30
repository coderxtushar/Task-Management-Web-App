import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllMyTasks = async () => {
            try {
                // Fetch all projects the user has access to
                const projectsRes = await API.get('/projects');
                const projects = projectsRes.data;
                
                let allTasks = [];
                // Fetch tasks for each project and filter by assignedTo
                for (const project of projects) {
                    try {
                        const tasksRes = await API.get(`/tasks/project/${project._id}`);
                        const tasksForMe = user.role === 'admin'
                            ? tasksRes.data
                            : tasksRes.data.filter(t => t.assignedTo && t.assignedTo._id === user.id);
                        // Attach project name to task for UI
                        const tasksWithProject = tasksForMe.map(t => ({...t, projectName: project.name, projectId: project._id}));
                        allTasks = [...allTasks, ...tasksWithProject];
                    } catch (err) {
                        console.error(`Failed to fetch tasks for project ${project._id}`, err);
                    }
                }
                
                // Sort by due date (closest first)
                allTasks.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
                setMyTasks(allTasks);
            } catch (err) {
                console.error('Failed to fetch tasks', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllMyTasks();
    }, [user.id]);

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading your tasks...</div>;

    const todoTasks = myTasks.filter(t => t.status === 'todo');
    const inProgressTasks = myTasks.filter(t => t.status === 'in progress');
    const doneTasks = myTasks.filter(t => t.status === 'done');

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
                <p className="text-slate-400 mb-8">
                    {user.role === 'admin' 
                        ? "Here's an overview of all tasks across your projects." 
                        : "Here's an overview of your assigned tasks across all projects."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">To Do</h3>
                        <p className="text-3xl font-bold text-slate-200">{todoTasks.length}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">In Progress</h3>
                        <p className="text-3xl font-bold text-indigo-400">{inProgressTasks.length}</p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Done</h3>
                        <p className="text-3xl font-bold text-emerald-400">{doneTasks.length}</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 flex items-center"><CheckSquare className="mr-2 text-indigo-500" /> {user.role === 'admin' ? 'All Active Tasks' : 'My Active Tasks'}</h2>
                
                {myTasks.length === 0 ? (
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400 shadow-md">
                        {user.role === 'admin' ? "There are no tasks in your projects right now." : "You don't have any tasks assigned to you right now."}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myTasks.filter(t => t.status !== 'done').map(task => (
                            <Link 
                                to={`/projects/${task.projectId}`} 
                                key={task._id}
                                className="block bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group shadow-md"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white transition-colors">{task.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">Project: {task.projectName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                            task.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                            task.status === 'in progress' ? 'text-indigo-400 border-indigo-400/50' : 'text-slate-400 border-slate-600'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                                {task.dueDate && (
                                    <div className="mt-4 flex items-center text-sm text-slate-400">
                                        <Clock size={14} className="mr-1.5" />
                                        Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
