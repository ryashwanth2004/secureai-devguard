import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface StudentUser {
  username: string;
  name: string;
  email: string;
  major: string;
  gpa: number;
  role: string;
}

interface AuthContextType {
  user: StudentUser | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  isLoggedIn: boolean;
  isAuthPatched: boolean;
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USERS: Record<string, { password: string; name: string; email: string; major: string; gpa: number }> = {
  alice: {
    password: 'alice2024',
    name: 'Alice Johnson',
    email: 'alice.johnson@studenthub.edu',
    major: 'Computer Science & AI',
    gpa: 3.88
  },
  bob: {
    password: 'bob2024',
    name: 'Bob Smith',
    email: 'bob.smith@studenthub.edu',
    major: 'Cybersecurity Engineering',
    gpa: 3.72
  },
  student: {
    password: 'pass123',
    name: 'Student Demo Account',
    email: 'demo@studenthub.edu',
    major: 'Software Engineering',
    gpa: 3.65
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(() => {
    try {
      const saved = localStorage.getItem('sh_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthPatched, setIsAuthPatched] = useState(false);

  // Poll backend deployments to dynamically detect when Admin approves the Auth patch
  const refreshAuthStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/deployment/`);
      if (Array.isArray(res.data)) {
        const authDeploy = res.data.find(d =>
          (d.status === 'deployed') &&
          (d.title?.toLowerCase().includes('password') ||
           d.title?.toLowerCase().includes('auth') ||
           d.title?.toLowerCase().includes('login'))
        );
        setIsAuthPatched(!!authDeploy);
      }
    } catch {
      // Backend not reached
    }
  };

  useEffect(() => {
    refreshAuthStatus();
    const interval = setInterval(refreshAuthStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  const login = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const account = DEMO_USERS[cleanUser];

    if (!account) {
      return {
        success: false,
        message: "Invalid username. Please enter 'alice', 'bob', or 'student'."
      };
    }

    // AFTER ADMIN APPROVAL: The patch has been deployed!
    if (isAuthPatched) {
      // Strict password validation (Bug is FIXED)
      if (!password || password.trim() === "") {
        return {
          success: false,
          message: "Authentication Rejected: Empty passwords are not permitted. A valid password is now required following security patch deployment."
        };
      }

      if (account.password === password) {
        const userData: StudentUser = {
          username: cleanUser,
          name: account.name,
          email: account.email,
          major: account.major,
          gpa: account.gpa,
          role: "student"
        };
        setUser(userData);
        localStorage.setItem('sh_student_session', JSON.stringify(userData));
        return { success: true };
      }

      return {
        success: false,
        message: "Invalid password. (Hint: password for alice is 'alice2024')."
      };
    }

    // BEFORE ADMIN APPROVAL: Intentional Educational Bug #1 (Auth Bypass)
    // If password is submitted as empty string "", login unintentionally grants access!
    if (password === "") {
      const userData: StudentUser = {
        username: cleanUser,
        name: account.name,
        email: account.email,
        major: account.major,
        gpa: account.gpa,
        role: "student"
      };
      setUser(userData);
      localStorage.setItem('sh_student_session', JSON.stringify(userData));
      return { success: true };
    }

    if (account.password === password) {
      const userData: StudentUser = {
        username: cleanUser,
        name: account.name,
        email: account.email,
        major: account.major,
        gpa: account.gpa,
        role: "student"
      };
      setUser(userData);
      localStorage.setItem('sh_student_session', JSON.stringify(userData));
      return { success: true };
    }

    return {
      success: false,
      message: "Invalid credentials. Please verify your username and password."
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sh_student_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoggedIn: !!user,
      isAuthPatched,
      refreshAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
