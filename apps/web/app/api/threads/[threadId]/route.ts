import { prisma } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = { params: { threadId: string } };

// Get a single thread
export async function GET(_request: NextRequest, { params }: Params) {
    const thread = await prisma.thread.findUnique({ where: { id: params.threadId } });
    if (!thread) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(thread);
}

// Update a thread (title / pinned)
export async function PATCH(request: NextRequest, { params }: Params) {
    const body = await request.json();
    const data: Record<string, unknown> = { updatedAt: new Date() };

    if (body.title !== undefined) data.title = body.title;
    if (body.pinned !== undefined) {
        data.pinned = body.pinned;
        data.pinnedAt = new Date();
    }
    if (body.projectId !== undefined) data.projectId = body.projectId;

    const thread = await prisma.thread.update({
        where: { id: params.threadId },
        data,
    });
    return NextResponse.json(thread);
}

// Delete a thread (items cascade)
export async function DELETE(_request: NextRequest, { params }: Params) {
    await prisma.thread.delete({ where: { id: params.threadId } });
    return NextResponse.json({ ok: true });
}
