"use client";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import PricingModal from "./PricingModal";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <PricingModal />
        </AuthProvider>
    );
}
