import type { NextApiRequest } from "next";

import { GsrStatsResponse } from "@geospatialregistry/sdk";

import { fetchStats } from "~/api/stats";
import { fetchCatchResponse } from "../../api/services/responses/api-fetcher-responses";
import { NextApiResponseType } from "../../api/services/responses/api-responses";

/**
 * Fetch stats about the GSR.
 * @route /api/stats
 */
export default async function getStats(
  _req: NextApiRequest,
  res: NextApiResponseType<GsrStatsResponse>
) {
  const { statusCode, body } = await fetchStats().catch(fetchCatchResponse);

  res.status(statusCode).json(body);
}
