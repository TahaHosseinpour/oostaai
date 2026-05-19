import { prisma } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// List all threads, newest first
export async function GET() {
    const threads = await prisma.thread.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(threads);
}

// Create a thread
export async function POST(request: NextRequest) {
    const body = await request.json();
    const now = new Date();
    const thread = await prisma.thread.create({
        data: {
            id: body.id,
            title: body.title || 'New Thread',
            createdAt: body.createdAt ? new Date(body.createdAt) : now,
            updatedAt: now,
            pinned: body.pinned ?? false,
            pinnedAt: body.pinnedAt ? new Date(body.pinnedAt) : now,
            projectId: body.projectId ?? null,
        },
    });
    return NextResponse.json(thread, { status: 201 });
}

// Delete all threads (and their items via cascade)
export async function DELETE() {
    await prisma.thread.deleteMany({});
    return NextResponse.json({ ok: true });
}
