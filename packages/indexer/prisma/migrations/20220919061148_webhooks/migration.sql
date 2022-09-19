-- CreateTable
CREATE TABLE "Webhooks" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhooks_pkey" PRIMARY KEY ("id")
);
