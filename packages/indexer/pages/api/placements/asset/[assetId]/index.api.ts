import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  SinglePlacementResponse,
} from "@geospatialregistry/sdk";

import { getPlacementByAssetId } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/responses/api-fetcher-responses";

/**
 * Fetch the latest placement by assetId
 */
export default async function placementByAssetId(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SinglePlacementResponse>>
) {
  const assetId = req.query.assetId as string;
  const publisher = req.query.publisher as string;

  const { statusCode, body } = await getPlacementByAssetId(
    assetId,
    publisher
  ).catch(fetchCatchResponse);

  res.status(statusCode).send(body);
}
