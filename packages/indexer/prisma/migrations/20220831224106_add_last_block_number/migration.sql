/*
  Warnings:

  - Added the required column `placedByOwner` to the `Placement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Placement" ADD COLUMN     "placedByOwner" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "ServiceState" (
    "id" INTEGER NOT NULL,
    "lastBlockNumber" INTEGER NOT NULL,

    CONSTRAINT "ServiceState_pkey" PRIMARY KEY ("id")
);
