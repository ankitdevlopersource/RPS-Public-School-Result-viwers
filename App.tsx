import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { StudentSearch } from './components/StudentSearch';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Spinner } from './components/Icons';
import { View, User, Student, AuditLogEntry } from './types';
import { generateMockStudents } from './services/geminiService';

// This is the main component that controls the entire application flow.
const App: React.FC = () => {
    // State management for the entire application
    const [view, setView] = useState<View>(View.STUDENT_SEARCH);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [students, setStudents] = useState<Record<string, Student>>({});
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [principalSignature, setPrincipalSignature] = useState<string | null>(null);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to add entries to the audit log
    const addAuditLog = useCallback((action: string) => {
        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            user: loggedInUser?.username || 'System',
            action,
        };
        setAuditLog(prevLog => [entry, ...prevLog]);
    }, [loggedInUser]);

    // Initialize application with mock data on first load
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // 1. Create initial user accounts
                const initialUsers: Record<string, User> = {
                    'headteacher': { username: 'headteacher', passwordHash: 'admin123', role: 'HEAD_TEACHER' },
                    'teacher1': { username: 'teacher1', passwordHash: 'teacher123', role: 'TEACHER' },
                };
                setUsers(initialUsers);

                // 2. Generate mock student data using Gemini API
                // In a real app, this would be a fetch call to a backend.
                if (process.env.API_KEY) {
                    const mockStudents = await generateMockStudents(15);
                    const studentsRecord = mockStudents.reduce((acc, student) => {
                        acc[student.rollNumber] = student;
                        return acc;
                    }, {} as Record<string, Student>);
                    setStudents(studentsRecord);
                } else {
                    console.warn("API_KEY is not set. Skipping mock data generation.");
                }
                
                // 3. Add initial log entry
                setAuditLog([{ timestamp: new Date().toISOString(), user: 'System', action: 'Application Initialized.' }]);
            } catch (err: any) {
                console.error("Initialization failed:", err);
                setError("Could not initialize the application. Please ensure your API key is valid and try again.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    // Effect to handle view changes upon logout
    useEffect(() => {
        if (!loggedInUser && (view === View.ADMIN_DASHBOARD || view === View.TEACHER_DASHBOARD)) {
            setView(View.LOGIN);
        }
    }, [loggedInUser, view]);

    // Render a loading spinner while initializing
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <Spinner className="w-12 h-12 text-indigo-600" />
                <p className="mt-4 text-lg text-gray-700">Loading School Data...</p>
            </div>
        );
    }

    // Render an error message if initialization fails
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Initialization Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    
    // Switch between different views of the application
    switch (view) {
        case View.LOGIN:
            return <Login users={users} setLoggedInUser={setLoggedInUser} setView={setView} addAuditLog={addAuditLog} />;
        
        case View.ADMIN_DASHBOARD:
            if (loggedInUser?.role === 'HEAD_TEACHER') {
                return (
                    <AdminDashboard
                        loggedInUser={loggedInUser}
                        setLoggedInUser={setLoggedInUser}
                        users={users}
                        setUsers={setUsers}
                        principalSignature={principalSignature}
                        setPrincipalSignature={setPrincipalSignature}
                        auditLog={auditLog}
                        addAuditLog={addAuditLog}
                    />
                );
            }
            // Fallback to login if user is not an admin
            setView(View.LOGIN);
            return null;

        case View.TEACHER_DASHBOARD:
            if (loggedInUser?.role === 'TEACHER') {
                return (
                    <TeacherDashboard
                        students={students}
                        loggedInUser={loggedInUser}
                        setStudents={setStudents}
                        setLoggedInUser={setLoggedInUser}
                        addAuditLog={addAuditLog}
                    />
                );
            }
            // Fallback to login if user is not a teacher
            setView(View.LOGIN);
            return null;

        case View.STUDENT_SEARCH:
        default:
            return <StudentSearch students={students} principalSignature={principalSignature} setView={setView} />;
    }
};

export default App;
