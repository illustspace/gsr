// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  PlacementQueryResponse,
} from "@geospatialregistry/sdk";

import { fetchPlacementsByQuery } from "~/api/fetchPlacements";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<PlacementQueryResponse>>
) {
  const { statusCode, body } = await fetchPlacementsByQuery(req.query).catch(
    fetchCatchResponse
  );

  res.status(statusCode).send(body);
}
