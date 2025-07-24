// File: src/Profile/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { getMyProfile } from '../api/apiClient';
import type { User } from '../types';
import { UserCircle, Mail } from 'lucide-react';

const ProfilePage: React.FC = () => {
    // State to hold user data, loading status, and any errors
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the user's profile information when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const profileData = await getMyProfile();
                setUser(profileData);
            } catch (err) {
                setError('Failed to load your profile. Please try logging in again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []); // The empty dependency array ensures this runs only once

    // --- Render Logic ---

    if (isLoading) {
        return <div className="p-8 text-center font-semibold">Loading Profile...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    if (!user) {
        return <div className="p-8 text-center">Could not find user data.</div>;
    }

    // --- Main Component View ---

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
                <p className="text-gray-500 mt-1">View your account details below.</p>
            </header>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="space-y-4">
                    {/* Username Field */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                            <UserCircle size={16} className="mr-2" />
                            Username
                        </label>
                        <p className="mt-1 text-lg text-gray-800 font-semibold bg-gray-50 p-3 rounded-md">
                            {user.username}
                        </p>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                            <Mail size={16} className="mr-2" />
                            Email Address
                        </label>
                        <p className="mt-1 text-lg text-gray-800 font-semibold bg-gray-50 p-3 rounded-md">
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>To change your password or delete your account, please go to the Settings page.</p>
            </div>
        </div>
    );
};

export default ProfilePage;