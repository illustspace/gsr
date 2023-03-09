import { IndexerSyncResponse } from "@geospatialregistry/sdk";
import cors from "cors";

import { apiFailure } from "~/api/services/responses/api-responses";
import { getApiEnv } from "~/features/config/apiEnv";
import { syncIndexer } from "~/api/services/sync.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";
import { runMiddleware } from "~/api/services/runMiddleware";

/** Last time the update function was run. Used to stop DDOS requests. */
let lastUpdatedTimestamp = 0;

/** Request an indexer run against the GSR. Should be called when a new placement has been added to the GSR. */
export default wrapServiceEndpoint<IndexerSyncResponse>(async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors());

  const now = Date.now();
  if (lastUpdatedTimestamp > now - getApiEnv("syncRateLimitMs")) {
    res
      .status(429)
      .json(
        apiFailure(
          "Too many requests. Please wait a second before trying again.",
          "TOO_MANY_REQUESTS"
        )
      );
    return;
  }

  lastUpdatedTimestamp = now;

  const { statusCode, body } = await syncIndexer();

  res.status(statusCode).json(body);
});
