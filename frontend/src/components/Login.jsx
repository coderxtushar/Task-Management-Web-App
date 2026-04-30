import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.includes('@') || !email.includes('.')) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (password.trim() === '') {
            toast.error('Password is required.');
            return;
        }

        try {
            setIsLoading(true);
            const res = await API.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            toast.success('Successfully logged in!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold text-center text-white">Login to TaskManager</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 mt-1 text-slate-900 bg-slate-100 border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 text-slate-900 bg-slate-100 border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-sm text-center text-slate-400">
                    Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
