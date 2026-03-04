import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.POLLINATIONS_API_KEY;
const BASE_URL = "https://gen.pollinations.ai";

export async function POST(req: NextRequest) {
    try {
        const { prompt, seed } = await req.json();

        const imageUrl = `${BASE_URL}/image/${encodeURIComponent(prompt)}?model=flux&width=1748&height=2480&seed=${seed}&key=${API_KEY}`;

        // Return the URL (client will use <img src=...> directly)
        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error("[/api/pollinations/image] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
