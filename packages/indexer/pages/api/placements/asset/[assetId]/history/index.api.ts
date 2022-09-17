import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  PlacementQueryResponse,
} from "@geospatialregistry/sdk";

import { getPlacementHistoryByAssetId } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

/**
 * Fetch the placement history of an asset.
 */
export default async function placementHistory(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<PlacementQueryResponse>>
) {
  const assetId = req.query.assetId as string;
  const includeInvalid = req.query.includeInvalid as string;

  const placedByOwner = includeInvalid !== "true";

  const { statusCode, body } = await getPlacementHistoryByAssetId(
    assetId,
    placedByOwner
  ).catch(fetchCatchResponse);

  res.status(statusCode).send(body);
}
