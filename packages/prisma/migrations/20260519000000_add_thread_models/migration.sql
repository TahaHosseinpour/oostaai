-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Thread',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadItem" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "parentId" TEXT,
    "query" TEXT NOT NULL DEFAULT '',
    "mode" TEXT NOT NULL,
    "status" TEXT DEFAULT 'QUEUED',
    "answer" JSONB,
    "steps" JSONB,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "sources" JSONB,
    "suggestions" JSONB,
    "object" JSONB,
    "metadata" JSONB,
    "error" TEXT,
    "imageAttachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Thread_createdAt_idx" ON "Thread"("createdAt");

-- CreateIndex
CREATE INDEX "Thread_pinned_idx" ON "Thread"("pinned");

-- CreateIndex
CREATE INDEX "ThreadItem_threadId_idx" ON "ThreadItem"("threadId");

-- CreateIndex
CREATE INDEX "ThreadItem_parentId_idx" ON "ThreadItem"("parentId");

-- CreateIndex
CREATE INDEX "ThreadItem_createdAt_idx" ON "ThreadItem"("createdAt");

-- AddForeignKey
ALTER TABLE "ThreadItem" ADD CONSTRAINT "ThreadItem_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
