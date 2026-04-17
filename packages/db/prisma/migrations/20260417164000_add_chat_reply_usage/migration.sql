CREATE TABLE "ChatReplyUsage" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "assistantMessageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ChatReplyUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatReplyUsage_assistantMessageId_key"
ON "ChatReplyUsage"("assistantMessageId");

CREATE INDEX "ChatReplyUsage_actorId_createdAt_idx"
ON "ChatReplyUsage"("actorId", "createdAt" DESC);

ALTER TABLE "ChatReplyUsage"
ADD CONSTRAINT "ChatReplyUsage_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "UserActor"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ChatReplyUsage" ("id", "actorId", "assistantMessageId", "createdAt")
SELECT
  message."id",
  session."actorId",
  message."id",
  message."createdAt"
FROM "ChatMessage" AS message
INNER JOIN "ChatSession" AS session
ON session."id" = message."sessionId"
WHERE message."role" = 'assistant'
  AND (
    message."completionStatus" = 'completed'
    OR message."completionStatus" = 'interrupted'
    OR message."completionStatus" IS NULL
  )
ON CONFLICT ("assistantMessageId") DO NOTHING;
