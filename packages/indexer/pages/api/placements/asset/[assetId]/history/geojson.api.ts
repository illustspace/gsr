import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseError,
  ApiResponseFail,
  PlacementGeoJsonResponse,
} from "@geospatialregistry/sdk";

import { getPlacementHistoryGeoJsonByAssetId } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

/**
 * Fetch the placement history of an asset.
 */
export default async function placementHistory(
  req: NextApiRequest,
  res: NextApiResponse<
    PlacementGeoJsonResponse | ApiResponseFail | ApiResponseError
  >
) {
  const assetId = req.query.assetId as string;
  const includeInvalid = req.query.includeInvalid as string;

  const placedByOwner = includeInvalid !== "true";

  const { statusCode, body } = await getPlacementHistoryGeoJsonByAssetId(
    assetId,
    placedByOwner
  ).catch(fetchCatchResponse);

  if (body.status === "success") {
    res.status(statusCode).send(body.data);
  } else {
    res.status(statusCode).send(body);
  }
}
