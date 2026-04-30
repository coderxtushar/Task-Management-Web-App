import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ProjectDashboard = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';
    const [analytics, setAnalytics] = useState(null);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const projectRes = await API.get('/projects');
                const currentProject = projectRes.data.find(p => p._id === projectId);
                setProject(currentProject);

                const res = await API.get(`/tasks/dashboard/${projectId}`);
                setAnalytics(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchDashboardData();
    }, [projectId]);

    if (!analytics || !project) {
        return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Analytics...</div>;
    }

    const pieData = {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{
            data: [
                analytics.byStatus['todo'] || 0,
                analytics.byStatus['in progress'] || 0,
                analytics.byStatus['done'] || 0
            ],
            backgroundColor: ['#94a3b8', '#6366f1', '#34d399'],
            borderColor: ['#94a3b8', '#6366f1', '#34d399'],
            borderWidth: 1,
        }],
    };

    const barData = {
        labels: analytics.byUser.map(u => u.name),
        datasets: [{
            label: 'Tasks Assigned',
            data: analytics.byUser.map(u => u.count),
            backgroundColor: '#6366f1',
            borderRadius: 4,
        }],
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-8">
                    <Link to={`/projects`} className="text-slate-400 hover:text-white mr-4"><ArrowLeft /></Link>
                    <h1 className="text-3xl font-bold">{project.name} - Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Tasks</h3>
                        <p className="text-3xl font-bold">{analytics.totalTasks}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-4 w-full text-left">Task Status</h3>
                        <div className="w-64 h-64"><Pie data={pieData} /></div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-4 w-full text-left">Workload Distribution</h3>
                        <div className="w-full h-64">
                            <Bar 
                                data={barData} 
                                options={{ 
                                    maintainAspectRatio: false, 
                                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }, 
                                    plugins: { legend: { display: false } } 
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {analytics.overdueTasks && analytics.overdueTasks.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-red-400 flex items-center"><AlertCircle className="mr-2" /> Overdue Tasks</h3>
                        <div className="space-y-4">
                            {analytics.overdueTasks.map(task => (
                                <div key={task._id} className="bg-slate-900 p-4 rounded border border-red-500/30 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{task.title}</h4>
                                        <span className="text-sm text-slate-400 flex items-center mt-1"><Clock size={14} className="mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <Link to={`/projects/${projectId}`} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">View Task</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDashboard;
