CREATE TYPE "ChatMessageCompletionStatus" AS ENUM ('completed', 'interrupted');

ALTER TABLE "ChatMessage"
ADD COLUMN "completionStatus" "ChatMessageCompletionStatus";
