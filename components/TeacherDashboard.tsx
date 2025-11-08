import React, { useState, useMemo } from 'react';
import { Student, User } from '../types';
import { StudentForm } from './StudentForm';
import { LogoutIcon, EditIcon, TrashIcon, UserIcon } from './Icons';

// Props for the TeacherDashboard component
interface TeacherDashboardProps {
    students: Record<string, Student>;
    loggedInUser: User;
    setStudents: React.Dispatch<React.SetStateAction<Record<string, Student>>>;
    setLoggedInUser: (user: User | null) => void;
    addAuditLog: (action: string) => void;
}

type SortableKeys = keyof Pick<Student, 'rollNumber' | 'studentName' | 'fatherName'>;

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
    students,
    loggedInUser,
    setStudents,
    setLoggedInUser,
    addAuditLog
}) => {
    // State to manage the student form modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    
    // State for search and sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'rollNumber', direction: 'ascending'});

    // Memoized processing of students list for filtering and sorting
    const processedStudents = useMemo(() => {
        let studentArray = Object.values(students);

        // Filtering logic
        if (searchTerm) {
            studentArray = studentArray.filter(student =>
                student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting logic
        if (sortConfig !== null) {
            studentArray.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return studentArray;
    }, [students, searchTerm, sortConfig]);

    // Request sorting for a specific column
    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Handlers for opening the form
    const handleAddStudent = () => {
        setStudentToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setStudentToEdit(student);
        setIsFormOpen(true);
    };

    // Handler for deleting a student
    const handleDeleteStudent = (rollNumber: string) => {
        if (window.confirm(`Are you sure you want to delete the record for roll number ${rollNumber}?`)) {
            const updatedStudents = { ...students };
            delete updatedStudents[rollNumber];
            setStudents(updatedStudents);
            addAuditLog(`Deleted student record: ${rollNumber}`);
        }
    };

    // Handler for saving a student from the form
    const handleSaveStudent = (student: Student) => {
        setStudents(prev => ({
            ...prev,
            [student.rollNumber]: student,
        }));
        const action = studentToEdit ? `Updated student: ${student.rollNumber}` : `Added new student: ${student.rollNumber}`;
        addAuditLog(action);
        setIsFormOpen(false);
        setStudentToEdit(null);
    };

    // Handler for closing the form
    const handleCancel = () => {
        setIsFormOpen(false);
        setStudentToEdit(null);
    };
    
    // Handler for logging out
    const handleLogout = () => {
        setLoggedInUser(null);
        addAuditLog(`Logged out`);
    };

    // Helper to render sort indicator
    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <UserIcon className="w-8 h-8 mr-3 text-indigo-600"/>
                        Teacher Dashboard
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

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {/* Controls: Search and Add Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={handleAddStudent}
                            className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow"
                        >
                            + Add New Student
                        </button>
                    </div>

                    {/* Student Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    { (['rollNumber', 'studentName', 'fatherName'] as SortableKeys[]).map(key => (
                                        <th
                                            key={key}
                                            scope="col"
                                            onClick={() => requestSort(key)}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                        >
                                           {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} {getSortIndicator(key)}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {processedStudents.length > 0 ? processedStudents.map(student => (
                                    <tr key={student.rollNumber}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.fatherName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEditStudent(student)} className="text-indigo-600 hover:text-indigo-900 p-1">
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDeleteStudent(student.rollNumber)} className="text-red-600 hover:text-red-900 p-1">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">
                                            No student records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Student Form Modal */}
            {isFormOpen && (
                <StudentForm
                    studentToEdit={studentToEdit}
                    onSave={handleSaveStudent}
                    onCancel={handleCancel}
                    existingRollNumbers={Object.keys(students).filter(rn => rn !== studentToEdit?.rollNumber)}
                />
            )}
        </div>
    );
};