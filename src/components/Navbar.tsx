"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function Navbar() {
    const { user, credits, loading, setShowPricing } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUP, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isSignUP) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            setShowAuthModal(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            setShowAuthModal(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo">JunkJournal<span>AI</span></div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {loading ? (
                        <span style={{ fontSize: '0.9rem', color: 'gray' }}>Loading...</span>
                    ) : user ? (
                        <>
                            <span style={{ fontWeight: 600, color: 'var(--accent-sepia)' }}>
                                ⭐️ {credits} Credits
                            </span>
                            <button onClick={() => setShowPricing(true)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                Buy Credits
                            </button>
                            <button onClick={() => signOut(auth)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border-sepia)' }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '4px' }}>
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            {showAuthModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="paper-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            {isSignUP ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="email" placeholder="Email" required className="input-field"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                            <input
                                type="password" placeholder="Password" required className="input-field"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                            <button type="submit" className="btn" style={{ width: '100%' }}>
                                {isSignUP ? 'Sign Up' : 'Log In'}
                            </button>
                        </form>

                        <div style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-sepia)' }} />
                            <span style={{ position: 'absolute', top: '-0.7rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-paper)', padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                OR
                            </span>
                        </div>

                        <button onClick={handleGoogleAuth} className="btn-secondary" style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', marginRight: '8px' }} />
                            Continue with Google
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {isSignUP ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <span
                                style={{ color: 'var(--accent-sepia)', cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => setIsSignUp(!isSignUP)}
                            >
                                {isSignUP ? 'Log In' : 'Sign Up'}
                            </span>
                        </p>
                        <button onClick={() => setShowAuthModal(false)} style={{
                            position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'gray'
                        }}>×</button>
                    </div>
                </div>
            )}
        </>
    );
}
