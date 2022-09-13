// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiResponseType, GsrStatsResponse } from "@geospatialregistry/sdk";

import { apiServerFailure, apiSuccess } from "~/api/api-responses";
import { getStats } from "~/api/stats";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<GsrStatsResponse>>
) {
  try {
    const stats = await getStats();

    res.status(200).json(apiSuccess(stats));
  } catch (error) {
    const { statusCode, body } = apiServerFailure(error);
    res.status(statusCode).send(body);
  }
}
