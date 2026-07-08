DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserNotificationType') THEN
    CREATE TYPE "UserNotificationType" AS ENUM ('PRODUCT_QUESTION_CREATED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserNotificationChannel') THEN
    CREATE TYPE "UserNotificationChannel" AS ENUM ('IN_APP', 'EMAIL');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "UserNotification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "UserNotificationType" NOT NULL,
  "channel" "UserNotificationChannel" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "linkUrl" TEXT,
  "readAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserNotification_userId_channel_createdAt_idx"
  ON "UserNotification"("userId", "channel", "createdAt");

CREATE INDEX IF NOT EXISTS "UserNotification_userId_channel_readAt_idx"
  ON "UserNotification"("userId", "channel", "readAt");

CREATE INDEX IF NOT EXISTS "UserNotification_channel_sentAt_idx"
  ON "UserNotification"("channel", "sentAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UserNotification_userId_fkey'
  ) THEN
    ALTER TABLE "UserNotification"
      ADD CONSTRAINT "UserNotification_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
