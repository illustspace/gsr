import { GsrStatsResponse } from "@geospatialregistry/sdk";
import { prisma } from "~/api/db";
import {
  FetchStatusWrapper,
  fetchSuccessResponse,
} from "./responses/api-fetcher-responses";

export const fetchStats = async (): Promise<
  FetchStatusWrapper<GsrStatsResponse>
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

  return fetchSuccessResponse({
    totalOwnedPlacements: totalOwnedPlacements.length,
    totalUnownedPlacements: totalUnownedPlacements.length,
    totalPublishers: totalPublishers.length,
  });
};
