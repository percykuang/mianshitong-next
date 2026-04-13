-- CreateEnum
CREATE TYPE "UserActorType" AS ENUM ('guest', 'registered');

-- CreateTable
CREATE TABLE "UserActor" (
    "id" TEXT NOT NULL,
    "type" "UserActorType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "authUserId" TEXT,
    "guestTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActor_pkey" PRIMARY KEY ("id")
);

-- Backfill registered actors for existing users
INSERT INTO "UserActor" (
    "id",
    "type",
    "displayName",
    "authUserId",
    "createdAt",
    "updatedAt",
    "lastSeenAt"
)
SELECT
    "id",
    'registered'::"UserActorType",
    "email",
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "AuthUser"
ON CONFLICT ("id") DO NOTHING;

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN "actorId" TEXT;

-- Backfill actor owner from existing user owner
UPDATE "ChatSession"
SET "actorId" = "userId"
WHERE "actorId" IS NULL AND "userId" IS NOT NULL;

-- AlterTable
ALTER TABLE "ChatSession" ALTER COLUMN "actorId" SET NOT NULL;
ALTER TABLE "ChatSession" ALTER COLUMN "userId" DROP NOT NULL;

-- DropIndex
DROP INDEX IF EXISTS "ChatSession_userId_pinned_pinnedAt_updatedAt_idx";
DROP INDEX IF EXISTS "ChatSession_userId_updatedAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "UserActor_authUserId_key" ON "UserActor"("authUserId");
CREATE UNIQUE INDEX "UserActor_guestTokenHash_key" ON "UserActor"("guestTokenHash");
CREATE INDEX "UserActor_type_lastSeenAt_idx" ON "UserActor"("type", "lastSeenAt" DESC);

CREATE INDEX "ChatSession_actorId_pinned_pinnedAt_updatedAt_idx" ON "ChatSession"("actorId", "pinned", "pinnedAt" DESC, "updatedAt" DESC);
CREATE INDEX "ChatSession_actorId_updatedAt_idx" ON "ChatSession"("actorId", "updatedAt" DESC);
CREATE INDEX "ChatSession_userId_updatedAt_idx" ON "ChatSession"("userId", "updatedAt" DESC);

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT IF EXISTS "ChatSession_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserActor" ADD CONSTRAINT "UserActor_authUserId_fkey"
FOREIGN KEY ("authUserId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "UserActor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
