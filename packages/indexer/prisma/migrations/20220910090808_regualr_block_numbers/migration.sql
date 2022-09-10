/*
  Warnings:

  - You are about to alter the column `blockNumber` on the `Placement` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `lastBlockNumber` on the `ServiceState` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Placement" ALTER COLUMN "blockNumber" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "ServiceState" ALTER COLUMN "lastBlockNumber" SET DATA TYPE INTEGER;
