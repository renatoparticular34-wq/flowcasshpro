
import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock User Types
interface User {
    id: string;
    email: string;
}

interface Session {
    user: User;
    access_token: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for a logged-in user (always logged in for local version)
        const mockUser = {
            id: 'local-user',
            email: 'usuario@local.com'
        };
        setUser(mockUser);
        setLoading(false);
    }, []);

    const signOut = async () => {
        // For local version, maybe we just reload or do nothing
        if (confirm('Deseja reiniciar os dados locais? Isso limpará todas as transações.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const session = user ? { user, access_token: 'mock-token' } : null;

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

