import React, { useState, useEffect } from 'react';
import { Student, SUBJECTS, Subject } from '../types';
import { compressImage } from '../services/imageService';
import { UploadIcon } from './Icons';

interface StudentFormProps {
    studentToEdit: Student | null;
    onSave: (student: Student) => void;
    onCancel: () => void;
    existingRollNumbers: string[];
}

// Initial empty state for a new student form
const initialStudentState: Student = {
    rollNumber: '',
    studentName: '',
    fatherName: '',
    dob: '',
    studentImage: '',
    marks: {
        hindi: 0,
        english: 0,
        mathematics: 0,
        science: 0,
        socialScience: 0,
        sanskrit: 0,
    },
};

export const StudentForm: React.FC<StudentFormProps> = ({ studentToEdit, onSave, onCancel, existingRollNumbers }) => {
    const [student, setStudent] = useState<Student>(initialStudentState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // If a student is being edited, populate the form with their data
    useEffect(() => {
        if (studentToEdit) {
            setStudent(studentToEdit);
            if (studentToEdit.studentImage) {
                setImagePreview(studentToEdit.studentImage);
            }
        } else {
            setStudent(initialStudentState);
            setImagePreview(null);
        }
    }, [studentToEdit]);

    // Handles changes for simple text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStudent(prev => ({ ...prev, [name]: value }));
    };

    // Handles changes for the marks inputs, ensuring values are between 0 and 100
    const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let mark = parseInt(value, 10);
        if (isNaN(mark)) mark = 0;
        if (mark < 0) mark = 0;
        if (mark > 100) mark = 100;

        setStudent(prev => ({
            ...prev,
            marks: { ...prev.marks, [name]: mark },
        }));
    };

    // Handles image file selection and triggers compression
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            setIsCompressing(true);
            try {
                // Compress the image to be between 20KB and 50KB
                const compressedBase64 = await compressImage(file, 20, 50);
                setStudent(prev => ({ ...prev, studentImage: compressedBase64 }));
                setImagePreview(compressedBase64);
            } catch (err: any) {
                setError(err.message);
                setImagePreview(student.studentImage || null);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    // Handles form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        // Validate unique roll number for new students
        if (!studentToEdit && existingRollNumbers.includes(student.rollNumber)) {
            setError('This Roll Number already exists. Please use a unique one.');
            return;
        }
        // Basic validation for required fields
        if (!student.rollNumber || !student.studentName || !student.fatherName || !student.dob) {
            setError('Please fill in all student details.');
            return;
        }
        onSave(student);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {studentToEdit ? 'Edit Student Result' : 'Add New Student Result'}
                        </h2>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Student Information</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                                    <input type="text" name="rollNumber" value={student.rollNumber} onChange={handleChange} disabled={!!studentToEdit} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Student Name</label>
                                    <input type="text" name="studentName" value={student.studentName} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Father's Name</label>
                                    <input type="text" name="fatherName" value={student.fatherName} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                                    <input type="date" name="dob" value={student.dob} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Student Photo</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-24 h-32 object-cover rounded"/>
                                        ) : (
                                            <div className="w-24 h-32 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Preview</div>
                                        )}
                                        <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} className="hidden"/>
                                        <label htmlFor="imageUpload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <UploadIcon className="w-5 h-5 inline mr-2"/>
                                            {isCompressing ? 'Compressing...' : (imagePreview ? 'Change Photo' : 'Upload Photo')}
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Image will be compressed to 20-50KB.</p>
                                </div>
                            </div>

                            {/* Marks Entry */}
                            <div className="space-y-4">
                               <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Subject Marks (out of 100)</h3>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                  {SUBJECTS.map(subject => (
                                    <div key={subject}>
                                      <label className="block text-sm font-medium text-gray-600 capitalize">{subject.replace('Science', ' Science')}</label>
                                      <input type="number" name={subject} value={student.marks[subject as Subject]} onChange={handleMarkChange} min="0" max="100" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                                    </div>
                                  ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Save Student
                        </button>
                        <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
