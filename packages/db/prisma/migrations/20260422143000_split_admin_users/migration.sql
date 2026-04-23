CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AdminUser" ("id", "email", "passwordHash", "createdAt", "updatedAt")
SELECT "id", "email", "passwordHash", "createdAt", "updatedAt"
FROM "AuthUser"
WHERE "role" = 'admin';

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

ALTER TABLE "AuthUser" DROP COLUMN "role";

DROP TYPE "AuthUserRole";
