// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from "next";

import { IndexerSyncResponse } from "@geospatialregistry/sdk";

import { apiFailure, NextApiResponseType } from "~/api/api-responses";
import { getApiEnv } from "~/features/config/apiEnv";
import { syncIndexer } from "~/api/sync";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

/** Last time the update function was run. Used to stop DDOS requests. */
let lastUpdatedTimestamp = 0;

/** Request an indexer run against the GSR. Should be called when a new placement has been added to the GSR. */
export default async function sync(
  _req: NextApiRequest,
  res: NextApiResponseType<IndexerSyncResponse>
) {
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

  const { statusCode, body } = await syncIndexer().catch(fetchCatchResponse);

  res.status(statusCode).json(body);
}
