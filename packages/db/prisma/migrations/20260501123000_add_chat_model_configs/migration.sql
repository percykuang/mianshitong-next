-- CreateEnum
CREATE TYPE "ChatModelProvider" AS ENUM ('deepseek', 'ollama', 'openaiCompatible');

-- CreateTable
CREATE TABLE "ChatModelConfig" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "provider" "ChatModelProvider" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKeyCiphertext" TEXT NOT NULL,
    "apiKeyPreview" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "supportsJsonOutput" BOOLEAN NOT NULL DEFAULT false,
    "modelKwargs" JSONB,
    "jsonModelKwargs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatModelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatModelConfig_enabled_isDefault_sortOrder_updatedAt_idx" ON "ChatModelConfig"("enabled", "isDefault", "sortOrder", "updatedAt" DESC);
