-- CreateTable
CREATE TABLE "Placement" (
    "id" SERIAL NOT NULL,
    "assetId" VARCHAR(255) NOT NULL,
    "parentAssetId" VARCHAR(255),
    "decodedAssetId" JSONB NOT NULL,
    "publisher" VARCHAR(255) NOT NULL,
    "published" BOOLEAN NOT NULL,
    "geohash" VARCHAR(255) NOT NULL,
    "sceneUri" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL,
    "timeRangeStart" TIMESTAMP(3) NOT NULL,
    "timeRangeEnd" TIMESTAMP(3) NOT NULL,
    "blockNumber" INTEGER NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);
