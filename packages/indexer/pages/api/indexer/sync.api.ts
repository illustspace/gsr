// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiResponseType, IndexerSyncResponse } from "@geospatialregistry/sdk";

import { prisma } from "~/api/db";
import { apiFailure, apiServerFailure, apiSuccess } from "~/api/api-responses";
import { placementToDb } from "~/api/db/dbToPlacement";
import { gsr } from "~/features/gsr/gsr-contract";

/** How long to wait between sync requests. */
const RATE_LIMIT_MS = Number(process.env.SYNC_RATE_LIMIT_MS);
/** Last time the update function was run. Used to stop DDOS requests. */
let lastUpdatedTimestamp = 0;

/** Request an indexer run against the GSR. Should be called when a new placement has been added to the GSR. */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<IndexerSyncResponse>>
) {
  const now = Date.now();
  if (lastUpdatedTimestamp > now - RATE_LIMIT_MS) {
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

  const sinceBlockNumber = await getLastBlockedProcessed();

  const { blockNumber, events } = await gsr.fetchEvents(sinceBlockNumber);

  try {
    // Verify placements.
    const placements = await Promise.all(
      events.map(async (placement) => {
        return gsr.verifyPlacement(placement);
      })
    );

    await prisma.$transaction([
      // Save the processed block
      prisma.serviceState.upsert({
        where: { id: 0 },
        create: { id: 0, lastBlockNumber: blockNumber },
        update: { lastBlockNumber: blockNumber },
      }),

      // Save all new placements.
      ...placements.map((placement) => {
        // todo: transaction
        return prisma.placement.create({ data: placementToDb(placement) });
      }),
    ]);

    res.status(200).json(
      apiSuccess({
        blockNumber,
        events: events.length,
      })
    );
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}

const getLastBlockedProcessed = async () => {
  const serviceState = await prisma.serviceState.findUnique({
    where: { id: 0 },
  });

  if (!serviceState) return 0;

  return serviceState.lastBlockNumber || 0;
};
