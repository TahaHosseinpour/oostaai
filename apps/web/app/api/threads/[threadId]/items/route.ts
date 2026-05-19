import { prisma } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = { params: { threadId: string } };

// JSON columns stored as-is
const JSON_FIELDS = [
    'answer',
    'steps',
    'toolCalls',
    'toolResults',
    'sources',
    'suggestions',
    'object',
    'metadata',
] as const;

function toItemData(threadId: string, body: any) {
    const data: Record<string, unknown> = {
        threadId,
        query: body.query ?? '',
        mode: body.mode,
        status: body.status ?? 'QUEUED',
        parentId: body.parentId ?? null,
        error: body.error ?? null,
        imageAttachment: body.imageAttachment ?? null,
        updatedAt: new Date(),
    };
    for (const f of JSON_FIELDS) {
        if (body[f] !== undefined) data[f] = body[f] ?? null;
    }
    return data;
}

// List items for a thread (chronological)
export async function GET(_request: NextRequest, { params }: Params) {
    const items = await prisma.threadItem.findMany({
        where: { threadId: params.threadId },
        orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(items);
}

// Upsert an item — used both for create and for streaming updates
export async function PUT(request: NextRequest, { params }: Params) {
    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    // The streaming client may PUT an item before the thread POST commits.
    // Guarantee the parent row exists so the FK never races.
    await prisma.thread.upsert({
        where: { id: params.threadId },
        update: {},
        create: { id: params.threadId },
    });

    const data = toItemData(params.threadId, body);
    const item = await prisma.threadItem.upsert({
        where: { id: body.id },
        update: data,
        create: {
            id: body.id,
            createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
            ...data,
        } as any,
    });
    return NextResponse.json(item);
}

// Delete followup items created after a given ISO timestamp
export async function DELETE(request: NextRequest, { params }: Params) {
    const after = request.nextUrl.searchParams.get('after');
    if (!after) {
        return NextResponse.json({ error: 'after param required' }, { status: 400 });
    }
    await prisma.threadItem.deleteMany({
        where: {
            threadId: params.threadId,
            createdAt: { gt: new Date(after) },
        },
    });
    return NextResponse.json({ ok: true });
}
