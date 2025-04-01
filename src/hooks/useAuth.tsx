
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

interface User extends UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (emailOrPhone: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string, phoneNumber?: string) => Promise<void>;
  logoutUser: () => void;
  loginWithGoogle: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const registerUser = async (email: string, password: string, name: string, phoneNumber?: string) => {
    setLoading(true);
    
    try {
      // This is a mock implementation - in a real app, you'd call an API
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phoneNumber,
        joinedDate: new Date().toISOString(),
        username: email.split('@')[0],
        language: 'english',
        darkMode: false,
        isPublic: true,
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Account created",
        description: "You have successfully created an account.",
      });
      
      navigate("/");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (emailOrPhone: string, password: string) => {
    setLoading(true);
    
    try {
      // This is a mock implementation - in a real app, you'd call an API
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For mock purposes, we'll determine if the input is an email or phone number
      const isEmail = emailOrPhone.includes('@');
      
      // Create a mock user
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: isEmail ? emailOrPhone.split('@')[0] : `User${Math.floor(Math.random() * 1000)}`,
        email: isEmail ? emailOrPhone : `user${Math.floor(Math.random() * 1000)}@example.com`,
        phoneNumber: !isEmail ? emailOrPhone : undefined,
        joinedDate: new Date().toISOString(),
        username: isEmail ? emailOrPhone.split('@')[0] : `user${Math.floor(Math.random() * 1000)}`,
        language: 'english',
        darkMode: false,
        isPublic: true,
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      
      navigate("/");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    
    try {
      // This is a mock implementation - in a real app, you'd use Firebase or another auth provider
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Google User",
        email: "user@gmail.com",
        photoURL: "https://lh3.googleusercontent.com/a/default-user",
        joinedDate: new Date().toISOString(),
        username: "googleuser",
        language: 'english',
        darkMode: false,
        isPublic: true,
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: "Welcome",
        description: "You have successfully signed in with Google.",
      });
      
      navigate("/");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    
    try {
      // This is a mock implementation - in a real app, you'd call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        loginWithGoogle,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
