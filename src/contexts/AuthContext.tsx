import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isPasswordRecovery: boolean;
    setPasswordRecoveryHandled: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    isPasswordRecovery: false,
    setPasswordRecoveryHandled: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
            console.log('🔐 Auth event:', event);

            // Detect password recovery event
            if (event === 'PASSWORD_RECOVERY') {
                console.log('🔑 Password recovery mode detected');
                setIsPasswordRecovery(true);
            }

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        setIsPasswordRecovery(false);
        await supabase.auth.signOut();
    };

    const setPasswordRecoveryHandled = () => {
        setIsPasswordRecovery(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signOut,
            isPasswordRecovery,
            setPasswordRecoveryHandled
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
