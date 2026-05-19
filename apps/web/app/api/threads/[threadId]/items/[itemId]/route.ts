import { prisma } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Params = { params: { threadId: string; itemId: string } };

// Delete a single thread item
export async function DELETE(_request: NextRequest, { params }: Params) {
    await prisma.threadItem.delete({ where: { id: params.itemId } });

    const remaining = await prisma.threadItem.count({
        where: { threadId: params.threadId },
    });

    // If the thread is now empty, drop it too
    if (remaining === 0) {
        await prisma.thread.delete({ where: { id: params.threadId } }).catch(() => {});
    }

    return NextResponse.json({ ok: true, remaining });
}
