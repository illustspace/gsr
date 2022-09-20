import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  SinglePlacementResponse,
} from "@geospatialregistry/sdk";

import { getPlacementByPlacementId } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

/**
 * Fetch the latest placement by assetId
 */
export default async function placementByPlacementId(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SinglePlacementResponse>>
) {
  const placementId = req.query.placementId as string;

  const { statusCode, body } = await getPlacementByPlacementId(
    Number(placementId)
  ).catch(fetchCatchResponse);

  res.status(statusCode).send(body);
}