import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const baseUrl = process.env.ELEVENLABS_BASE_URL || 'https://api.avalai.ir/v1';
    const modelId = process.env.ELEVENLABS_STT_MODEL || 'scribe_v2';

    if (!apiKey) {
        return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not configured' }, { status: 500 });
    }

    let incoming: FormData;
    try {
        incoming = await request.formData();
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const audio = incoming.get('audio');
    if (!(audio instanceof Blob)) {
        return NextResponse.json({ error: 'Missing audio blob' }, { status: 400 });
    }

    const language = (incoming.get('language') as string | null) || undefined;

    const arrayBuffer = await audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const audioBlob = new Blob([buffer], { type: 'audio/webm' });

    const upstream = new FormData();
    upstream.append('file', audioBlob, 'recording.webm');
    upstream.append('model', modelId);
    if (language) upstream.append('language', language);

    console.log('[transcribe] sending to:', `${baseUrl}/audio/transcriptions`, 'model:', modelId, 'size:', buffer.length);

    try {
        const res = await fetch(`${baseUrl}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: upstream,
            signal: AbortSignal.timeout(30_000),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error('[transcribe] upstream error:', res.status, errText);
            return NextResponse.json({ error: 'STT failed', details: errText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ text: data?.text ?? '', language: data?.language });
    } catch (e: any) {
        console.error('[transcribe] error:', e?.message, '| cause:', e?.cause?.message ?? e?.cause ?? e);
        return NextResponse.json({ error: 'Transcribe failed', message: e?.message, cause: String(e?.cause ?? '') }, { status: 500 });
    }
}
