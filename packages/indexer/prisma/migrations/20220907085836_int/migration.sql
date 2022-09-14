/*
  Warnings:

  - You are about to drop the column `geohash` on the `Placement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Placement" DROP COLUMN "geohash",
ADD COLUMN     "geohashBitPrecision" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "geohashBits" INTEGER NOT NULL DEFAULT 0;
