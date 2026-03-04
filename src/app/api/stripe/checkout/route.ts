import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "edge";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
    try {
        const { amount, credits, userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User not logged in" }, { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            client_reference_id: userId,
            metadata: {
                credits: credits.toString(),
                userId: userId,
            },
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${credits} AI Image Credits`,
                            description: `Generate ${credits} unique junk journal pages.`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.get("origin")}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get("origin")}/?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
