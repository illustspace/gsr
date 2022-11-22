-- CreateTable
CREATE TABLE "Placement" (
    "blockHash" STRING(255) NOT NULL DEFAULT '',
    "blockLogIndex" INT4 NOT NULL DEFAULT 0,
    "assetId" STRING(255) NOT NULL,
    "parentAssetId" STRING(255),
    "decodedAssetId" JSONB NOT NULL,
    "publisher" STRING(255) NOT NULL,
    "published" BOOL NOT NULL DEFAULT false,
    "geohashBits" INT8 NOT NULL DEFAULT 0,
    "geohashBitPrecision" INT4 NOT NULL DEFAULT 0,
    "sceneUri" STRING,
    "placedAt" TIMESTAMP(3) NOT NULL,
    "timeRangeStart" TIMESTAMP(3),
    "timeRangeEnd" TIMESTAMP(3),
    "tx" STRING(255) NOT NULL DEFAULT '',
    "placedByOwner" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("blockHash","blockLogIndex")
);

-- CreateTable
CREATE TABLE "ServiceState" (
    "id" INT4 NOT NULL,
    "lastBlockNumber" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfServeAsset" (
    "assetId" STRING(255) NOT NULL,
    "name" STRING NOT NULL DEFAULT '',
    "publisher" STRING(255) NOT NULL,
    "description" STRING,
    "imageUrl" STRING,
    "message" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelfServeAsset_pkey" PRIMARY KEY ("assetId")
);

-- CreateTable
CREATE TABLE "WalletNonces" (
    "address" STRING(255) NOT NULL,
    "nonce" INT4 NOT NULL DEFAULT 0,

    CONSTRAINT "WalletNonces_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "endpoint" STRING NOT NULL DEFAULT '',
    "active" BOOL NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);
