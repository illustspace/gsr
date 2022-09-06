// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  GsrChainId,
  GsrContract,
  IndexerSyncResponse,
} from "@gsr/sdk";

import { prisma } from "~/features/db";
import {
  apiFailure,
  apiServerFailure,
  apiSuccess,
} from "~/features/indexer/api-responses";

/** How long to wait between sync requests. */
const RATE_LIMIT_MS = 1000;
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

  const gsr = new GsrContract(
    {
      alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
      infura: process.env.NEXT_PUBLIC_INFURA_ID,
    },
    {
      chainId: Number(process.env.NEXT_PUBLIC_GSR_CHAIN_ID) as GsrChainId,
    }
  );

  const sinceBlockNumber = await getLastBlockedProcessed();

  const { blockNumber, events } = await gsr.fetchEvents(sinceBlockNumber || 0);

  try {
    await prisma.serviceState.upsert({
      where: { id: 0 },
      create: { id: 0, lastBlockNumber: blockNumber },
      update: { lastBlockNumber: blockNumber },
    });

    const promises = events.map(async (placement) => {
      const finalPlacement = await gsr.verifyPlacement(placement);

      // todo: transaction
      return prisma.placement.create({ data: finalPlacement });
    });

    await Promise.all(promises);

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

  if (!serviceState) return undefined;

  return serviceState.lastBlockNumber;
};
