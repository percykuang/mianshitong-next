-- CreateEnum
CREATE TYPE "AuthUserRole" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "AuthUser"
ADD COLUMN "role" "AuthUserRole" NOT NULL DEFAULT 'user';
