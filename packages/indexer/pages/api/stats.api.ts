import { GsrStatsResponse } from "@geospatialregistry/sdk";

import { wrapServiceEndpoint } from "~/api/services/responses/service-response";
import { fetchStats } from "~/api/services/stats.service";

/**
 * Fetch stats about the GSR.
 * @route /api/stats
 */
export default wrapServiceEndpoint<GsrStatsResponse>(async (_req, res) => {
  const { statusCode, body } = await fetchStats();

  res.status(statusCode).json(body);
});
