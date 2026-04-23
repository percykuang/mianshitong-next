CREATE TABLE "CareerThread" (
  "id" TEXT NOT NULL,
  "chatSessionId" TEXT NOT NULL,
  "state" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CareerThread_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CareerThread_chatSessionId_key" ON "CareerThread"("chatSessionId");

ALTER TABLE "CareerThread"
ADD CONSTRAINT "CareerThread_chatSessionId_fkey"
FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
