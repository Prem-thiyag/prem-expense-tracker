// File: src/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/apiClient';
import toast from 'react-hot-toast';
import loginImage from '../assets/login.jpg';
import { Eye, EyeOff, X, Info } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(identifier, password, rememberMe);
            toast.success("Login successful!");
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                toast.error("Incorrect username or password.");
            } else {
                toast.error("Login failed. Please check your connection and try again.");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-white">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-500 mb-6">Enter your email or username to access your account.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Email or Username</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="yourname or your@email.com" className="w-full p-3 mt-1 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    className="w-full p-3 mt-1 border rounded-lg pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                Remember Me
                                <span className="text-gray-400 text-xs">(7 days)</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-blue-600 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
                            {isLoading ? 'Logging In...' : 'Log In'}
                        </button>
                    </form>
                    <p className="text-sm text-center mt-6">
                        Don't Have An Account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register Now.</Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center p-12 rounded-l-3xl">
                <img src={loginImage} alt="Login" className="max-w-full max-h-full rounded-2xl shadow-xl" />
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Forgot Your Password?</h2>
                            <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-blue-800 leading-relaxed">
                                This app doesn't support automated password reset emails yet. To reset your password, please contact the <span className="font-semibold">admin</span>.
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">
                            Once your password is reset by the admin, you can log in and change it anytime from your <span className="font-medium text-gray-700">Profile page</span>.
                        </p>
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LoginPage;
