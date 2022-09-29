-- AlterTable
ALTER TABLE "Placement" ALTER COLUMN "published" SET DEFAULT false,
ALTER COLUMN "placedByOwner" SET DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceState" ALTER COLUMN "lastBlockNumber" SET DEFAULT 0;
