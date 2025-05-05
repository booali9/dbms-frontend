export type UserRole = 'admin' | 'student' | 'teacher' | 'canteen_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  semester?: number;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  department_id: string;
  semester: number;
  teacher_id: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent';
}

export interface Mark {
  id: string;
  student_id: string;
  course_id: string;
  marks: number;
  type: 'midterm' | 'final';
}