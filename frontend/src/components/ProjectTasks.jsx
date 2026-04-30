import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { ArrowLeft, Plus, Trash2, Calendar, Flag, User, X, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

const ProjectTasks = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [assignedTo, setAssignedTo] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchProjectAndTasks = async () => {
        try {
            const projectRes = await API.get('/projects');
            const currentProject = projectRes.data.find(p => p._id === projectId);
            setProject(currentProject);

            const tasksRes = await API.get(`/tasks/project/${projectId}`);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    useEffect(() => {
        fetchProjectAndTasks();
    }, [projectId]);

    const isAdmin = user?.role === 'admin';

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await API.post(`/tasks/project/${projectId}`, {
                title, description, dueDate, priority, status, assignedTo: assignedTo || null
            });
            setTitle(''); setDescription(''); setDueDate(''); setPriority('medium'); setStatus('todo'); setAssignedTo('');
            setShowForm(false);
            toast.success('Task created successfully');
            fetchProjectAndTasks();
        } catch (err) {
            console.error('Failed to create task', err);
            toast.error('Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async (task, updates) => {
        try {
            await API.put(`/tasks/${task._id}`, { ...task, ...updates });
            toast.success('Task updated');
            fetchProjectAndTasks();
        } catch (err) {
            console.error('Failed to update task', err);
            toast.error(err.response?.data?.msg || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await API.delete(`/tasks/${taskId}`);
            toast.success('Task deleted');
            fetchProjectAndTasks();
        } catch (err) {
            console.error('Failed to delete task', err);
            toast.error('Failed to delete task');
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskToMove = tasks.find(t => t._id === draggableId);
        if (!taskToMove) return;

        const canEdit = isAdmin || (taskToMove.assignedTo && taskToMove.assignedTo._id === user.id);
        if (!canEdit) {
            toast.error("You don't have permission to move this task.");
            return;
        }

        const newStatus = destination.droppableId;
        
        // Optimistic UI update
        const updatedTasks = tasks.map(t => {
            if (t._id === draggableId) {
                return { ...t, status: newStatus };
            }
            return t;
        });
        setTasks(updatedTasks);

        // API Call
        try {
            await API.put(`/tasks/${draggableId}`, { status: newStatus });
        } catch (err) {
            // Revert on failure
            fetchProjectAndTasks();
            toast.error('Failed to move task');
        }
    };

    if (!project) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

    const allMembers = [project.admin, ...project.members];

    const groupedTasks = {
        'todo': tasks.filter(t => t.status === 'todo'),
        'in progress': tasks.filter(t => t.status === 'in progress'),
        'done': tasks.filter(t => t.status === 'done')
    };

    const TaskCard = ({ task, index }) => {
        const canEdit = isAdmin || (task.assignedTo && task.assignedTo._id === user.id);

        const priorityColors = {
            low: 'bg-green-500/10 text-green-400 border-green-500/20',
            medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            high: 'bg-red-500/10 text-red-400 border-red-500/20'
        };

        return (
            <Draggable draggableId={task._id} index={index} isDragDisabled={!canEdit}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-slate-800 rounded-xl border p-4 mb-3 transition-all duration-200 group ${
                            snapshot.isDragging 
                                ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 rotate-1 z-50' 
                                : 'border-slate-700/50 hover:border-slate-600 shadow-sm hover:shadow-lg'
                        } ${!canEdit && 'opacity-80'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div 
                                    {...provided.dragHandleProps} 
                                    className={`text-slate-500 transition-colors ${canEdit ? 'hover:text-white cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-50'}`}
                                >
                                    <GripVertical size={16} />
                                </div>
                                <h4 className="font-semibold text-slate-100 text-sm leading-tight pr-2">{task.title}</h4>
                            </div>
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDeleteTask(task._id)} 
                                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        
                        {task.description && <p className="text-xs text-slate-400 mb-4 line-clamp-2 ml-6">{task.description}</p>}
                        
                        <div className="ml-6 flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
                            <div className="flex gap-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>
                                {task.dueDate && (
                                    <span className="flex items-center text-[10px] text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded border border-slate-600/30">
                                        <Calendar size={10} className="mr-1"/>
                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center">
                                {task.assignedTo ? (
                                    <div 
                                        className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-slate-800"
                                        title={`Assigned to ${task.assignedTo.name}`}
                                    >
                                        {task.assignedTo.name.charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    <div 
                                        className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600 border-dashed flex items-center justify-center text-[10px] text-slate-400"
                                        title="Unassigned"
                                    >
                                        <User size={10} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            <main className="flex-1 p-6 flex flex-col h-[calc(100vh)]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Link to="/projects" className="text-slate-400 hover:text-white mr-4">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{project.name} - Tasks</h2>
                            <p className="text-sm text-slate-400">Manage tasks and assignments</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        >
                            <Plus size={18} className="mr-2" /> {showForm ? 'Cancel' : 'New Task'}
                        </button>
                    )}
                </div>

                {showForm && isAdmin && (
                    <form onSubmit={handleCreateTask} className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input 
                                required type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500"
                            />
                            <input 
                                type="text" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500"
                            />
                            <input 
                                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500"
                            />
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500">
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500">
                                <option value="todo">To Do</option>
                                <option value="in progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-1 focus:ring-indigo-500">
                                <option value="">Unassigned</option>
                                {allMembers.map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded">
                                Create Task
                            </button>
                        </div>
                    </form>
                )}

                {/* 3-Column Kanban Board */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
                        {/* TODO Column */}
                        <div className="w-80 min-w-[320px] flex flex-col h-full max-h-full">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-slate-300 text-sm tracking-wide uppercase">
                                    To Do
                                </h3>
                                <span className="bg-slate-800 text-slate-400 text-xs font-semibold px-2 py-1 rounded-full border border-slate-700">
                                    {groupedTasks['todo'].length}
                                </span>
                            </div>
                            <Droppable droppableId="todo">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto rounded-2xl p-3 border-2 transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-slate-800/80 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800/50'
                                        }`}
                                    >
                                        {groupedTasks['todo'].map((task, index) => <TaskCard key={task._id} task={task} index={index} />)}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                        {/* IN PROGRESS Column */}
                        <div className="w-80 min-w-[320px] flex flex-col h-full max-h-full">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-indigo-400 text-sm tracking-wide uppercase flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
                                    In Progress
                                </h3>
                                <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2 py-1 rounded-full border border-indigo-500/20">
                                    {groupedTasks['in progress'].length}
                                </span>
                            </div>
                            <Droppable droppableId="in progress">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto rounded-2xl p-3 border-2 transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-slate-800/80 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800/50'
                                        }`}
                                    >
                                        {groupedTasks['in progress'].map((task, index) => <TaskCard key={task._id} task={task} index={index} />)}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                        {/* DONE Column */}
                        <div className="w-80 min-w-[320px] flex flex-col h-full max-h-full">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-emerald-400 text-sm tracking-wide uppercase flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                    Done
                                </h3>
                                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-500/20">
                                    {groupedTasks['done'].length}
                                </span>
                            </div>
                            <Droppable droppableId="done">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto rounded-2xl p-3 border-2 transition-colors ${
                                            snapshot.isDraggingOver ? 'bg-slate-800/80 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800/50'
                                        }`}
                                    >
                                        {groupedTasks['done'].map((task, index) => <TaskCard key={task._id} task={task} index={index} />)}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                </DragDropContext>
            </main>
        </div>
    );
};

export default ProjectTasks;
