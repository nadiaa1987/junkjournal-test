import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const API_KEY = process.env.POLLINATIONS_API_KEY;
const BASE_URL = "https://gen.pollinations.ai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json(
                { error: errText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[/api/pollinations/text] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
