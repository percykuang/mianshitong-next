CREATE TYPE "ChatSessionTitleSource" AS ENUM ('fallback', 'ai', 'manual');

ALTER TABLE "ChatSession"
  ADD COLUMN "titleSource" "ChatSessionTitleSource" NOT NULL DEFAULT 'fallback';
