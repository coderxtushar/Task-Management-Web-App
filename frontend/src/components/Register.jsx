import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters long.');
        }

        try {
            setIsLoading(true);
            const res = await API.post('/auth/register', { name, email, password });
            login(res.data.token, res.data.user);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            // Handled by global interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
                <h2 className="mb-8 text-3xl font-bold text-center text-white">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 mt-1 text-slate-900 bg-slate-100 border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
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
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 text-slate-900 bg-slate-100 border border-slate-700 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 text-white bg-indigo-600 rounded-lg transition-colors font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800'}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-sm text-center text-slate-400">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
