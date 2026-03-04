"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const tiers = [
    { credits: 1000, price: 9.99, bestValue: false },
    { credits: 3000, price: 19.99, bestValue: false },
    { credits: 5000, price: 29.99, bestValue: true },
];

export default function PricingModal() {
    const { showPricing, setShowPricing, user } = useAuth();
    const [loadingTier, setLoadingTier] = useState<number | null>(null);

    if (!showPricing) return null;

    const handleCheckout = async (credits: number, price: number) => {
        if (!user) {
            alert("Please sign in first to buy credits.");
            setShowPricing(false);
            return;
        }

        setLoadingTier(credits);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: price, credits, userId: user.uid }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Failed to create checkout session");
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        }
        setLoadingTier(null);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
            <div className="paper-card" style={{ width: '100%', maxWidth: '800px', padding: '3rem', position: 'relative' }}>
                <button onClick={() => setShowPricing(false)} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                    fontSize: '2rem', cursor: 'pointer', color: 'var(--text-secondary)'
                }}>×</button>

                <h2 className="handwritten" style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '1rem' }}>Get More Pages</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                    Running low on magic? Top up your credits to continue generating unique, exquisite junk journal pages. 1 Credit = 1 Unique Image.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    {tiers.map((tier) => (
                        <div key={tier.credits} style={{
                            border: `2px solid ${tier.bestValue ? 'var(--accent-sepia)' : 'var(--border-sepia)'}`,
                            borderRadius: '8px', padding: '2rem', textAlign: 'center',
                            background: tier.bestValue ? '#fdfbf7' : 'white', position: 'relative'
                        }}>
                            {tier.bestValue && (
                                <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-sepia)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                    Best Value
                                </span>
                            )}
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-ink)' }}>{tier.credits} Credits</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-sepia)', marginBottom: '1.5rem' }}>${tier.price}</p>
                            <button
                                onClick={() => handleCheckout(tier.credits, tier.price)}
                                disabled={loadingTier !== null}
                                className="btn"
                                style={{ width: '100%' }}
                            >
                                {loadingTier === tier.credits ? "Processing..." : "Select Plan"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
