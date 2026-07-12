CREATE TABLE IF NOT EXISTS "SocialAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "providerEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_provider_providerAccountId_key"
  ON "SocialAccount"("provider", "providerAccountId");

CREATE INDEX IF NOT EXISTS "SocialAccount_userId_provider_idx"
  ON "SocialAccount"("userId", "provider");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SocialAccount_userId_fkey'
  ) THEN
    ALTER TABLE "SocialAccount"
      ADD CONSTRAINT "SocialAccount_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
