import { GsrStatsResponse } from "@geospatialregistry/sdk";
import { prisma } from "~/api/db";
import {
  GsrIndexerServiceWrapper,
  fetchSuccessResponse,
} from "./responses/service-response";

/** Get overall GSR stats */
export const fetchStats = async (): Promise<
  GsrIndexerServiceWrapper<GsrStatsResponse>
> => {
  const [totalOwnedPlacements, totalUnownedPlacements, totalPublishers] =
    await prisma.$transaction([
      // All asset IDs with at least one good placement.
      prisma.placement.findMany({
        distinct: ["assetId"],
        where: {
          // Good placements
          placedByOwner: true,
        },
        select: { assetId: true },
      }),

      // All asset IDs with at least one good bad placement.
      prisma.placement.findMany({
        distinct: ["assetId"],
        where: {
          placedByOwner: false,
        },
        select: { assetId: true },
      }),

      prisma.placement.findMany({
        distinct: ["publisher"],
        where: {
          placedByOwner: false,
        },
        select: { assetId: true },
      }),
    ]);

  return fetchSuccessResponse({
    totalOwnedPlacements: totalOwnedPlacements.length,
    totalUnownedPlacements: totalUnownedPlacements.length,
    totalPublishers: totalPublishers.length,
  });
};
