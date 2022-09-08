import { GsrStats } from "@gsr/sdk";
import { prisma } from "~/api/db";

export const getStats = async (): Promise<GsrStats> => {
  const [totalOwnedPlacements, totalUnownedPlacements, totalPublishers] =
    await prisma.$transaction([
      // All asset IDs with at least one good placement.
      prisma.placement.findMany({
        distinct: ["assetId"],
        where: {
          // Good placements
          placedByOwner: true,
        },
        select: { id: true },
      }),

      // All asset IDs with at least one good bad placement.
      prisma.placement.findMany({
        distinct: ["assetId"],
        where: {
          placedByOwner: false,
        },
        select: { id: true },
      }),

      prisma.placement.findMany({
        distinct: ["publisher"],
        where: {
          placedByOwner: false,
        },
        select: { id: true },
      }),
    ]);

  return {
    totalOwnedPlacements: totalOwnedPlacements.length,
    totalUnownedPlacements: totalUnownedPlacements.length,
    totalPublishers: totalPublishers.length,
  };
};
