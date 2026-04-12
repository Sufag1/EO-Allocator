import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for an existing session on load
    const storedSession = localStorage.getItem('eo_session');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
  }, []);

  const login = (email, password) => {
    // Basic local auth validation
    const storedUsers = JSON.parse(localStorage.getItem('eo_users') || '[]');
    const existingUser = storedUsers.find(u => u.email === email && u.password === password);
    
    if (existingUser) {
      const sessionUser = { email: existingUser.email, name: existingUser.name };
      setUser(sessionUser);
      localStorage.setItem('eo_session', JSON.stringify(sessionUser));
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const signup = (name, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('eo_users') || '[]');
    const userExists = storedUsers.some(u => u.email === email);
    
    if (userExists) {
      return { success: false, message: 'User with this email already exists' };
    }
    
    storedUsers.push({ name, email, password });
    localStorage.setItem('eo_users', JSON.stringify(storedUsers));
    
    // Automatically login after signup
    const sessionUser = { email, name };
    setUser(sessionUser);
    localStorage.setItem('eo_session', JSON.stringify(sessionUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eo_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
