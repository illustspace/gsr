/*
  Warnings:

  - The primary key for the `Placement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockNumber` on the `Placement` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Placement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Placement" DROP CONSTRAINT "Placement_pkey",
DROP COLUMN "blockNumber",
DROP COLUMN "id",
ADD COLUMN     "blockHash" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "blockLogIndex" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "Placement_pkey" PRIMARY KEY ("blockHash", "blockLogIndex");
