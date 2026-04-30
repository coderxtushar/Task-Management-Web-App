import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectTasks from './components/ProjectTasks';
import ProjectDashboard from './components/ProjectDashboard';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    return <Layout>{children}</Layout>;
};

const App = () => {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects" element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects/:projectId" element={
                        <ProtectedRoute>
                            <ProjectTasks />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects/:projectId/dashboard" element={
                        <ProtectedRoute>
                            <ProjectDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
