-- AlterTable
ALTER TABLE "Placement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SelfServeAsset" (
    "assetId" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "publisher" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelfServeAsset_pkey" PRIMARY KEY ("assetId")
);
