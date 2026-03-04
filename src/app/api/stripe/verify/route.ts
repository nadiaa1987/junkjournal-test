import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
    try {
        const { session_id } = await req.json();
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            return NextResponse.json({
                success: true,
                credits: parseInt(session.metadata?.credits || "0", 10),
                userId: session.metadata?.userId
            });
        }

        return NextResponse.json({ success: false });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
