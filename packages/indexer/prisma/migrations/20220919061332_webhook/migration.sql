/*
  Warnings:

  - You are about to drop the `Webhooks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Webhooks";

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);
