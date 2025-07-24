// File: src/auth/RegisterPage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/apiClient';
import toast from 'react-hot-toast';
import PasswordStrength from './PasswordStrength';
import registerImage from '../assets/register.png';

// Validation utility functions
const isEmailValid = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPasswordStrong = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[\W_]/.test(password);
};

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const emailError = useMemo(() => email && !isEmailValid(email) ? "Please enter a valid email address." : null, [email]);
    const passwordMatchError = useMemo(() => confirmPassword && password !== confirmPassword ? "Passwords do not match." : null, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        //! THIS IS THE FIX: Pre-submission validation with specific toasts
        if (!username.trim()) {
            toast.error("Please enter your name.");
            return;
        }
        if (emailError) {
            toast.error(emailError);
            return;
        }
        if (!isPasswordStrong(password)) {
            toast.error("Password does not meet all the security requirements.");
            return;
        }
        if (passwordMatchError) {
            toast.error(passwordMatchError);
            return;
        }
        
        setIsLoading(true);
        // This part will only run if all frontend validations pass
        try {
            await register({ email, username, password });
            toast.success("Account created successfully! Please log in.", { id: `register-success`, duration: 4000 });
            navigate('/login');
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || "Registration failed. That username or email may already be taken.";
            toast.error(errorMessage, { id: `register-error` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-white">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
                    <p className="text-gray-500 mb-6">Join now to streamline your experience from day one.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Name</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g., Steven Gerrard" className="w-full p-3 mt-1 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., your@email.com" className={`w-full p-3 mt-1 border rounded-lg ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" className="w-full p-3 mt-1 border rounded-lg" required />
                        </div>
                         <div>
                            <label className="text-sm font-semibold">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className={`w-full p-3 mt-1 border rounded-lg ${passwordMatchError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
                            {passwordMatchError && <p className="text-xs text-red-500 mt-1">{passwordMatchError}</p>}
                            <PasswordStrength password={password} />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <p className="text-sm text-center mt-6">
                        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center p-12 rounded-l-3xl">
                <img src={registerImage} alt="Register" className="max-w-full max-h-full rounded-2xl shadow-xl" />
            </div>
        </div>
    );
};
export default RegisterPage;