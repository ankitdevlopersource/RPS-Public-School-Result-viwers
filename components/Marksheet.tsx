import React from 'react';
import { Student, SUBJECTS, Subject } from '../types';
import { PrintIcon, SearchIcon } from './Icons';

interface MarksheetProps {
    student: Student;
    principalSignature: string | null;
    onNewSearch: () => void;
}

// Helper to capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Calculates grade based on percentage
const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+ (Outstanding)';
    if (percentage >= 80) return 'A (Excellent)';
    if (percentage >= 70) return 'B (Very Good)';
    if (percentage >= 60) return 'C (Good)';
    if (percentage >= 50) return 'D (Satisfactory)';
    if (percentage >= 33) return 'E (Sufficient)';
    return 'F (Fail)';
};

export const Marksheet: React.FC<MarksheetProps> = ({ student, principalSignature, onNewSearch }) => {
    
    // Calculate total marks, maximum marks, and percentage
    const totalMarks = SUBJECTS.reduce((acc, subject) => acc + (student.marks[subject as Subject] || 0), 0);
    const maxMarks = SUBJECTS.length * 100;
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const grade = calculateGrade(parseFloat(percentage));
    const isPass = parseFloat(percentage) >= 33;

    return (
        <div className="min-h-screen bg-gray-200 p-4 sm:p-8 flex flex-col items-center font-sans">
            {/* Action buttons (hidden on print) */}
            <div className="w-full max-w-4xl mb-4 flex justify-end space-x-2 print:hidden">
                <button
                    onClick={onNewSearch}
                    className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <SearchIcon className="w-5 h-5 mr-2" />
                    New Search
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <PrintIcon className="w-5 h-5 mr-2" />
                    Print Marksheet
                </button>
            </div>

            {/* Marksheet container with A4-like aspect ratio and a professional border */}
            <div id="marksheet" className="bg-white shadow-lg w-full max-w-4xl border-8 border-double border-indigo-900 relative overflow-hidden flex flex-col" style={{'aspectRatio': '1 / 1.414'}}>
                {/* Watermark in the background */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <p className="text-indigo-50 text-8xl font-bold opacity-50 transform -rotate-45 select-none" style={{ letterSpacing: '0.5rem' }}>
                        R.P.S. PUBLIC
                    </p>
                </div>
                
                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
                    {/* Header */}
                    <header className="text-center mb-6 border-b-2 border-indigo-800 pb-4">
                        <h1 className="text-4xl md:text-5xl font-serif text-indigo-900 tracking-wider">R.P.S. Public School</h1>
                        <p className="text-lg text-gray-700 mt-2">Annual Examination Marksheet - 2024</p>
                    </header>

                    {/* Student Details & Photo */}
                    <section className="flex justify-between items-start mb-6">
                        <div className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-2 text-base w-3/4">
                            <strong className="text-gray-800">Student Name:</strong> <span className="text-gray-900">{student.studentName}</span>
                            <strong className="text-gray-800">Roll Number:</strong> <span className="text-gray-900">{student.rollNumber}</span>
                            <strong className="text-gray-800">Father's Name:</strong> <span className="text-gray-900">{student.fatherName}</span>
                            <strong className="text-gray-800">Date of Birth:</strong> <span className="text-gray-900">{student.dob}</span>
                        </div>
                        <div className="w-1/4 flex justify-end">
                             {student.studentImage ? (
                                <img src={student.studentImage} alt="Student" className="w-28 h-36 object-cover border-2 border-gray-400 p-1 bg-white" />
                            ) : (
                                <div className="w-28 h-36 border-2 border-gray-400 flex items-center justify-center text-gray-500 bg-gray-50">
                                    No Photo
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Marks Table */}
                    <section className="mb-6">
                        <table className="w-full border-collapse border border-gray-500">
                            <thead className="bg-indigo-200 text-indigo-900 font-semibold">
                                <tr>
                                    <th className="border border-gray-500 p-3 text-left">Subject</th>
                                    <th className="border border-gray-500 p-3">Max Marks</th>
                                    <th className="border border-gray-500 p-3">Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SUBJECTS.map((subject, index) => (
                                    <tr key={subject} className={index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                                        <td className="border border-gray-500 p-3">{capitalize(subject.replace('Science', ' Science'))}</td>
                                        <td className="border border-gray-500 p-3 text-center">100</td>
                                        <td className="border border-gray-500 p-3 text-center">{student.marks[subject as Subject]}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="font-bold bg-indigo-200 text-indigo-900">
                                <tr>
                                    <td className="border border-gray-500 p-3 text-right">Total</td>
                                    <td className="border border-gray-500 p-3 text-center">{maxMarks}</td>
                                    <td className="border border-gray-500 p-3 text-center">{totalMarks}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>

                    {/* Summary Section - pushed to the bottom */}
                    <section className="grid grid-cols-3 gap-4 text-center font-semibold mt-auto">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="text-sm text-gray-600">Percentage</p>
                            <p className="text-2xl text-indigo-800">{percentage}%</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="text-sm text-gray-600">Result</p>
                            <p className={`text-2xl font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                                {isPass ? 'PASS' : 'FAIL'}
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="text-sm text-gray-600">Grade</p>
                            <p className="text-xl text-indigo-800">{grade}</p>
                        </div>
                    </section>
                </div>

                {/* Footer with Signature */}
                <footer className="relative z-10 flex justify-between items-end p-6 md:p-8 pt-4">
                    <div className="text-gray-600 text-sm">
                        <p>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                        {principalSignature && (
                            <img src={principalSignature} alt="Principal's Signature" className="h-16 mx-auto mb-1" />
                        )}
                        <p className="border-t-2 border-gray-600 pt-1 font-semibold text-gray-800">Principal's Signature</p>
                        <p className="text-sm text-gray-700">Dr. A. K. Sharma</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};