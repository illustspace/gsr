import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  SinglePlacementResponse,
} from "@geospatialregistry/sdk";

import { fetchPlacementByQuery } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/responses/api-fetcher-responses";

/**
 * Fetch the latest placement by decodedAssetId
 */
export default async function placementsSingle(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SinglePlacementResponse>>
) {
  const { statusCode, body } = await fetchPlacementByQuery(req.query).catch(
    fetchCatchResponse
  );

  res.status(statusCode).send(body);
}
