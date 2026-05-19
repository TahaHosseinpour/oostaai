import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const baseUrl = process.env.ELEVENLABS_BASE_URL || 'https://api.avalai.ir/v1';
    const modelId = process.env.ELEVENLABS_TTS_MODEL || 'eleven_flash_v2_5';
    const voice = process.env.ELEVENLABS_VOICE || 'coral';

    if (!apiKey) {
        return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not configured' }, { status: 500 });
    }

    let payload: { text?: string };
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const text = (payload?.text || '').trim();
    if (!text) {
        return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    try {
        const upstream = await fetch(`${baseUrl}/audio/speech`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: modelId, input: text, voice }),
        });

        if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text();
            console.error('[speak] upstream error:', upstream.status, errText);
            return NextResponse.json({ error: 'TTS failed', details: errText }, { status: upstream.status });
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store',
            },
        });
    } catch (e: any) {
        console.error('[speak] error:', e?.message);
        return NextResponse.json({ error: 'Speak failed', message: e?.message }, { status: 500 });
    }
}
