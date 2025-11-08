// Defines the structure for a user account (Head Teacher or Teacher)
export interface User {
  username: string;
  // In a real app, this would be a securely hashed password.
  // For this simulation, it's a plain string for simplicity.
  passwordHash: string; 
  role: 'HEAD_TEACHER' | 'TEACHER';
}

// Defines the structure for a student's record
export interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  dob: string; // Stored as 'YYYY-MM-DD'
  studentImage: string; // Base64 encoded image string
  marks: {
    hindi: number;
    english: number;
    mathematics: number;
    science: number;
    socialScience: number;
    sanskrit: number;
  };
}

// Defines the structure for an entry in the audit log
export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
}

// Enum for different views/pages in the application using string values for clarity
export enum View {
  LOGIN = 'LOGIN',
  STUDENT_SEARCH = 'STUDENT_SEARCH',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
}

// Defines the subjects available
export const SUBJECTS = [
  'hindi', 'english', 'mathematics', 'science', 'socialScience', 'sanskrit'
] as const;

export type Subject = typeof SUBJECTS[number];
