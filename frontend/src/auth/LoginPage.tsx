// File: src/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/apiClient';
import toast from 'react-hot-toast';
import loginImage from '../assets/login.jpg';
import { Eye, EyeOff } from 'lucide-react'; // Import the icons

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(identifier, password);
            toast.success("Login successful!");
            navigate('/dashboard', { replace: true });
        } catch (error: any) {
            // This logic is now correct and will work with the global Toaster
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
                            {/* //! THIS IS THE FIX for the eye icon */}
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} // Dynamically change type
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder="Your password" 
                                    className="w-full p-3 mt-1 border rounded-lg pr-10" // Add padding for the icon
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
                            <label className="flex items-center gap-2"><input type="checkbox"/> Remember Me</label>
                            <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
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
        </div>
    );
};
export default LoginPage;