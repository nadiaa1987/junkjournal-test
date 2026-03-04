"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, increment } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    credits: number;
    loading: boolean;
    showPricing: boolean;
    setShowPricing: (show: boolean) => void;
    deductCredits: (amount: number) => Promise<boolean>;
    addCredits: (amount: number, targetId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    credits: 0,
    loading: true,
    showPricing: false,
    setShowPricing: () => { },
    deductCredits: async () => false,
    addCredits: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [credits, setCredits] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(userRef);
                if (!docSnap.exists()) {
                    // Initialize new user with 5 free credits
                    await setDoc(userRef, { email: currentUser.email, credits: 5 });
                }

                // Listen to credit changes
                const unsubscribeDoc = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        setCredits(doc.data().credits || 0);
                    }
                });
                setLoading(false);
                return () => unsubscribeDoc();
            } else {
                setCredits(0);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const deductCredits = async (amount: number) => {
        if (user && credits >= amount) {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { credits: increment(-amount) }, { merge: true });
            return true;
        } else if (user && credits < amount) {
            setShowPricing(true);
            return false;
        }
        return false;
    };

    const addCredits = async (amount: number, targetId?: string) => {
        const uid = targetId || user?.uid;
        if (uid) {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, { credits: increment(amount) }, { merge: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, credits, loading, showPricing, setShowPricing, deductCredits, addCredits }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
