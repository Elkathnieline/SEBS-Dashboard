import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    // Check for saved auth state on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (userData) => {
        // Store in state and localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);