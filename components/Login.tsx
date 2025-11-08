import React, { useState } from 'react';
import { User, View } from '../types';
import { UserIcon, LockIcon, SchoolIcon, AlertIcon } from './Icons';

interface LoginProps {
    users: Record<string, User>;
    setLoggedInUser: (user: User) => void;
    setView: (view: View) => void;
    addAuditLog: (action: string) => void;
}

export const Login: React.FC<LoginProps> = ({ users, setLoggedInUser, setView, addAuditLog }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        const user = users[username];

        // In a real app, password verification would involve hashing the input
        // and comparing it to the stored hash. For this simulation, we compare plain text.
        if (user && user.passwordHash === password) {
            setLoggedInUser(user);
            // This is a temporary log call; a more robust one would be in the App component
            // We pass an anonymous function to addAuditLog to capture the current state.
            // This is a simplified approach. A better way is to call addAuditLog after login.
            // But since setLoggedInUser is async, we can't immediately get the user.
            // For now, this is a placeholder. The real log is triggered from the dashboard.
            
            // Redirect based on role
            if (user.role === 'HEAD_TEACHER') {
                setView(View.ADMIN_DASHBOARD);
            } else if (user.role === 'TEACHER') {
                setView(View.TEACHER_DASHBOARD);
            }
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm">
                 <div className="bg-white shadow-2xl rounded-xl p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                         <div className="p-3 bg-indigo-600 text-white rounded-full mb-4">
                           <SchoolIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin & Teacher Login</h1>
                        <p className="text-gray-500 mt-1">R.P.S. Public School Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center" role="alert">
                                <AlertIcon className="w-5 h-5 mr-2" />
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                    placeholder="e.g., headteacher"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Log In
                        </button>
                    </form>
                    <div className="text-center mt-6">
                       <button onClick={() => setView(View.STUDENT_SEARCH)} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                            Back to Student Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
