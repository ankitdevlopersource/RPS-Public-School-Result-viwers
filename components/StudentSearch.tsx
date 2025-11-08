import React, { useState, useEffect, useCallback } from 'react';
import { Student, View } from '../types';
import { Marksheet } from './Marksheet';
import { AlertIcon, SearchIcon, SchoolIcon } from './Icons';

// Props for the StudentSearch component
interface StudentSearchProps {
    students: Record<string, Student>; // A map of roll numbers to student data
    principalSignature: string | null;
    setView: (view: View) => void;
}

// Generates a simple arithmetic question for the captcha
const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return {
        num1,
        num2,
        answer: num1 + num2,
        question: `What is ${num1} + ${num2}?`,
    };
};

export const StudentSearch: React.FC<StudentSearchProps> = ({ students, principalSignature, setView }) => {
    // State for form inputs
    const [rollNumber, setRollNumber] = useState('');
    const [dob, setDob] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    
    // State for managing UI
    const [error, setError] = useState<string | null>(null);
    const [foundStudent, setFoundStudent] = useState<Student | null>(null);
    const [captcha, setCaptcha] = useState(generateCaptcha());

    // Regenerate captcha on component mount
    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);
    
    // Handler for the search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFoundStudent(null);

        // Input validation
        if (!rollNumber || !dob || !captchaInput) {
            setError('All fields are required.');
            return;
        }

        if (parseInt(captchaInput, 10) !== captcha.answer) {
            setError('Incorrect answer to the security question.');
            // Regenerate captcha after a wrong attempt
            setCaptcha(generateCaptcha()); 
            setCaptchaInput('');
            return;
        }

        const student = students[rollNumber.trim()];

        // Check if student exists and DOB matches
        if (student && student.dob === dob) {
            setFoundStudent(student);
        } else {
            setError('Invalid Roll Number or Date of Birth. Please try again.');
        }
        
        // Always regenerate captcha after a search attempt
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
    };
    
    // Function to start a new search, clearing the current result
    const handleNewSearch = useCallback(() => {
        setFoundStudent(null);
        setRollNumber('');
        setDob('');
        setError(null);
    }, []);

    // Render the marksheet if a student is found, otherwise render the search form
    if (foundStudent) {
        return (
            <Marksheet
                student={foundStudent}
                principalSignature={principalSignature}
                onNewSearch={handleNewSearch}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
             <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-xl p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="p-3 bg-indigo-600 text-white rounded-full mb-4">
                           <SchoolIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">R.P.S. Public School</h1>
                        <p className="text-gray-500 mt-1">Student Result Portal</p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center" role="alert">
                                <AlertIcon className="w-5 h-5 mr-2" />
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div>
                            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">Roll Number</label>
                            <input
                                id="rollNumber"
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your roll number"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="captcha" className="block text-sm font-medium text-gray-700">{captcha.question}</label>
                            <input
                                id="captcha"
                                type="number"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Your answer"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                        >
                            <SearchIcon className="w-5 h-5 mr-2" />
                            Search Result
                        </button>
                    </form>
                    <div className="text-center mt-6">
                       <button onClick={() => setView(View.LOGIN)} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                            Admin / Teacher Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
