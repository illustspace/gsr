import {
  GeoJsonFeaturesCollection,
  PlacementId,
  placementIdToData,
  PlacementQueryResponse,
  SinglePlacementResponse,
} from "@geospatialregistry/sdk";

import { gsr } from "~/features/gsr/gsr-contract";
import { placementsToGeoJson } from "~/features/map/geo-json";
import {
  fetchFailResponse,
  GsrIndexerServiceWrapper,
  fetchSuccessResponse,
} from "./responses/service-response";
import { prisma } from "../db";
import { dbToPlacement } from "../db/dbToPlacement";

/** Fetch a single placement with a DecodedAssetId */
export const fetchPlacementByQuery = async (
  decodedAssetIdQuery: any,
  publisher?: string
): Promise<GsrIndexerServiceWrapper<SinglePlacementResponse>> => {
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

/** Fetch a placements with partial DecodedAssetId */
export const fetchPlacementsByQuery = async (
  query: any
): Promise<GsrIndexerServiceWrapper<PlacementQueryResponse>> => {
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

/** Fetch a single placement with a placement DB id */
export const getPlacementByPlacementId = async (
  placementId: string
): Promise<GsrIndexerServiceWrapper<SinglePlacementResponse>> => {
  let decodedPlacementId: PlacementId;
  try {
    decodedPlacementId = placementIdToData(placementId);
  } catch (e) {
    return fetchFailResponse(
      `Placement ID ${placementId} is invalid`,
      "INVALID_PLACEMENT_ID",
      400
    );
  }

  const placement = await prisma.placement.findUnique({
    where: {
      blockHash_blockLogIndex: decodedPlacementId,
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
): Promise<GsrIndexerServiceWrapper<PlacementQueryResponse>> => {
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

/** Get all placements for an asset as GeoJSON */
export const getPlacementHistoryGeoJsonByAssetId = async (
  assetId: string,
  placedByOwner: boolean
): Promise<GsrIndexerServiceWrapper<GeoJsonFeaturesCollection>> => {
  const placements = await prisma.placement.findMany({
    select: {
      blockHash: true,
      blockLogIndex: true,
      assetId: true,
      geohashBits: true,
      geohashBitPrecision: true,
    },
    where: {
      assetId,
      placedByOwner,
    },
    orderBy: {
      placedAt: "desc",
    },
  });

  const geojson = placementsToGeoJson(placements);

  return fetchSuccessResponse(geojson);
};

/** Fetch a single placement by hashed AssetId */
export const getPlacementByAssetId = async (
  assetId: string,
  publisher?: string
): Promise<GsrIndexerServiceWrapper<SinglePlacementResponse>> => {
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

/** Filter placements with a partial DecodedAssetId and return them as GeoJSON */
export const fetchPlacementsAsGeoJson = async (
  query: any
): Promise<GsrIndexerServiceWrapper<GeoJsonFeaturesCollection>> => {
  const decodedAssetId = query.assetType ? gsr.parseAssetId(query, true) : null;

  const placements = await prisma.placement.findMany({
    select: {
      blockHash: true,
      blockLogIndex: true,
      assetId: true,
      geohashBits: true,
      geohashBitPrecision: true,
    },
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
