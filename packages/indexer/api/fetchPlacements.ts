import {
  GeoJsonFeaturesCollection,
  PlacementQueryResponse,
  SinglePlacementResponse,
} from "~/../sdk/lib/cjs";
import { gsr } from "~/features/gsr/gsr-contract";
import { placementsToGeoJson } from "~/features/map/geo-json";
import {
  fetchFailResponse,
  FetchStatusWrapper,
  fetchSuccessResponse,
} from "./api-fetcher-responses";
import { prisma } from "./db";
import { dbToPlacement } from "./db/dbToPlacement";

export const fetchPlacementByQuery = async (
  decodedAssetIdQuery: any,
  publisher?: string
): Promise<FetchStatusWrapper<SinglePlacementResponse>> => {
  const query = gsr.parseAssetId(decodedAssetIdQuery);

  const placement = await prisma.placement.findFirst({
    where: {
      // Filter by valid placements, unless a publisher is specified.
      placedByOwner: !publisher,
      decodedAssetId: { equals: query },
      publisher: publisher?.toLowerCase() || undefined,
      OR: [
        {
          timeRangeStart: {
            lte: new Date(),
          },
        },
        {
          timeRangeStart: null,
        },
      ],
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  // 404 if the placement doesn't exist or was un-published.
  if (!placement?.published) {
    return fetchFailResponse("Asset not published", "NO_PLACEMENT", 404);
  }
  const validatedPlacement = dbToPlacement(placement);

  return fetchSuccessResponse(validatedPlacement);
};

export const fetchPlacementsByQuery = async (
  query: any
): Promise<FetchStatusWrapper<PlacementQueryResponse>> => {
  const decodedAssetId = gsr.parseAssetId(query, true);

  const placements = await prisma.placement.findMany({
    // Get assets that match the query.
    where: {
      placedByOwner: true,
      OR: [
        {
          timeRangeStart: {
            lte: new Date(),
          },
        },
        {
          timeRangeStart: null,
        },
      ],
      decodedAssetId: { equals: decodedAssetId },
    },
    // Only return return the latest placement for the asset.
    distinct: ["assetId"],
    orderBy: {
      placedAt: "desc",
    },
  });

  const validatedPlacements = placements.map(dbToPlacement);

  return fetchSuccessResponse(validatedPlacements);
};

export const getPlacementByPlacementId = async (
  placementId: number
): Promise<FetchStatusWrapper<SinglePlacementResponse>> => {
  const placement = await prisma.placement.findUnique({
    where: {
      id: placementId,
    },
  });

  // 404 if the placement doesn't exist or was un-published.
  if (!placement?.published) {
    return fetchFailResponse(
      `Placement ${placementId} not found`,
      "NO_PLACEMENT",
      404
    );
  }

  const validatedPlacement = dbToPlacement(placement);
  return fetchSuccessResponse(validatedPlacement);
};

/** Get all placements for an asset */
export const getPlacementHistoryByAssetId = async (
  assetId: string,
  placedByOwner: boolean
): Promise<FetchStatusWrapper<PlacementQueryResponse>> => {
  const placements = await prisma.placement.findMany({
    where: {
      assetId,
      placedByOwner,
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  const validatedPlacements = placements.map(dbToPlacement);
  return fetchSuccessResponse(validatedPlacements);
};

export const getPlacementByAssetId = async (
  assetId: string,
  publisher?: string
): Promise<FetchStatusWrapper<SinglePlacementResponse>> => {
  const placement = await prisma.placement.findFirst({
    where: {
      // Filter by valid placements, unless a publisher is specified.
      placedByOwner: !publisher,
      assetId,
      publisher: publisher?.toLowerCase() || undefined,
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  // 404 if the placement doesn't exist or was un-published.
  if (!placement?.published) {
    return fetchFailResponse("Asset not published", "NO_PLACEMENT", 404);
  }

  const validatedPlacement = dbToPlacement(placement);
  return fetchSuccessResponse(validatedPlacement);
};

export const fetchPlacementsAsGeoJson = async (
  query: any
): Promise<FetchStatusWrapper<GeoJsonFeaturesCollection>> => {
  const decodedAssetId = query.assetType ? gsr.parseAssetId(query, true) : null;

  const placements = await prisma.placement.findMany({
    // Get assets that match the query.
    where: {
      placedByOwner: true,
      decodedAssetId: decodedAssetId ? { equals: decodedAssetId } : undefined,
      OR: [
        {
          timeRangeStart: {
            lte: new Date(),
          },
        },
        {
          timeRangeStart: null,
        },
      ],
    },
    // Only return return the latest placement for the asset.
    distinct: ["assetId"],
    orderBy: {
      placedAt: "desc",
    },
  });

  const geojson = placementsToGeoJson(placements);

  return fetchSuccessResponse(geojson);
};
