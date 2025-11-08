import React, { useState } from 'react';
import { User, AuditLogEntry, View } from '../types';
import {
    LogoutIcon,
    DashboardIcon,
    UserIcon,
    TrashIcon,
    PlusIcon,
    SignatureIcon,
    UploadIcon,
    AuditLogIcon
} from './Icons';

// Props for the AdminDashboard component
interface AdminDashboardProps {
    loggedInUser: User;
    setLoggedInUser: (user: User | null) => void;
    users: Record<string, User>;
    setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
    principalSignature: string | null;
    setPrincipalSignature: (signature: string | null) => void;
    auditLog: AuditLogEntry[];
    addAuditLog: (action: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    loggedInUser,
    setLoggedInUser,
    users,
    setUsers,
    principalSignature,
    setPrincipalSignature,
    auditLog,
    addAuditLog,
}) => {
    // State for the new teacher form
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Handler for adding a new teacher
    const handleAddTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newUsername || !newPassword) {
            setError('Username and password are required.');
            return;
        }
        if (users[newUsername]) {
            setError('This username already exists.');
            return;
        }
        const newTeacher: User = {
            username: newUsername,
            passwordHash: newPassword, // In a real app, hash this password on the server
            role: 'TEACHER',
        };
        setUsers(prev => ({ ...prev, [newUsername]: newTeacher }));
        addAuditLog(`Created new teacher account: ${newUsername}`);
        setNewUsername('');
        setNewPassword('');
    };

    // Handler for deleting a user
    const handleDeleteUser = (username: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${username}"? This cannot be undone.`)) {
            const updatedUsers = { ...users };
            delete updatedUsers[username];
            setUsers(updatedUsers);
            addAuditLog(`Deleted user: ${username}`);
        }
    };
    
    // Handler for signature upload
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPrincipalSignature(reader.result as string);
                addAuditLog('Updated principal signature.');
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler for logging out
    const handleLogout = () => {
        addAuditLog(`Logged out`);
        setLoggedInUser(null);
    };

    // Filter to show only teacher accounts in the list
    const teacherUsers = Object.values(users).filter(u => u.role === 'TEACHER');

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <DashboardIcon className="w-8 h-8 mr-3 text-indigo-600" />
                        Administrator Dashboard
                    </h1>
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-4">Welcome, {loggedInUser.username}</span>
                        <button onClick={handleLogout} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            <LogoutIcon className="w-5 h-5 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Teacher Management and Signature */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Manage Teachers Panel */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <UserIcon className="w-6 h-6 mr-2 text-gray-500" /> Manage Teacher Accounts
                            </h2>
                            {/* Add Teacher Form */}
                            <form onSubmit={handleAddTeacher} className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                                <input
                                    type="text"
                                    placeholder="New Teacher Username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <button type="submit" className="flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                                    <PlusIcon className="w-5 h-5 mr-1" /> Add
                                </button>
                            </form>
                             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            {/* Teacher List */}
                            <ul className="space-y-3">
                                {teacherUsers.map(user => (
                                    <li key={user.username} className="flex justify-between items-center p-3 bg-white border rounded-md">
                                        <span className="text-gray-700">{user.username}</span>
                                        <button onClick={() => handleDeleteUser(user.username)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                                {teacherUsers.length === 0 && <p className="text-center text-gray-500">No teacher accounts exist.</p>}
                            </ul>
                        </div>

                        {/* Signature Panel */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <SignatureIcon className="w-6 h-6 mr-2 text-gray-500" /> Principal's Signature
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="w-1/2">
                                    <p className="text-sm text-gray-600 mb-2">The uploaded signature will appear on all student marksheets.</p>
                                    <input type="file" id="signatureUpload" accept="image/png, image/jpeg" onChange={handleSignatureUpload} className="hidden" />
                                    <label htmlFor="signatureUpload" className="cursor-pointer inline-flex items-center bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <UploadIcon className="w-5 h-5 mr-2" />
                                        {principalSignature ? 'Change Signature' : 'Upload Signature'}
                                    </label>
                                </div>
                                <div className="w-1/2 p-4 border rounded-md bg-gray-50 flex justify-center items-center h-28">
                                    {principalSignature ? (
                                        <img src={principalSignature} alt="Principal's Signature" className="max-h-full" />
                                    ) : (
                                        <p className="text-gray-400">No signature uploaded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audit Log */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-h-[70vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center sticky top-0 bg-white pb-4">
                                <AuditLogIcon className="w-6 h-6 mr-2 text-gray-500" /> Audit Log
                            </h2>
                            <ul className="space-y-3">
                                {auditLog.map((entry, index) => (
                                    <li key={index} className="p-3 bg-gray-50 border-l-4 border-indigo-300 rounded-r-md">
                                        <p className="text-sm text-gray-800 font-medium">{entry.action}</p>
                                        <p className="text-xs text-gray-500">
                                            by <span className="font-semibold">{entry.user}</span> on {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
