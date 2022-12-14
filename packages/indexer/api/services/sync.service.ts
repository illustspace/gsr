import { IndexerSyncResponse } from "@geospatialregistry/sdk";
import { gsr } from "~/features/gsr/gsr-contract";
import {
  GsrIndexerServiceWrapper,
  fetchSuccessResponse,
} from "./responses/service-response";
import { prisma } from "../db";
import { placementToDb } from "../db/dbToPlacement";
import { sendWebhooks } from "./webhooks/send-webhooks.service";

/** Sync new placements from the GSR smart contract */
export const syncIndexer = async (): Promise<
  GsrIndexerServiceWrapper<IndexerSyncResponse>
> => {
  const lastBlockNumber = await getLastBlockNumberProcessed();

  const { blockNumber, events } = await gsr.fetchEvents(lastBlockNumber);

  // Verify placements.
  const placements = await Promise.all(
    events.map(async (placement) => {
      return gsr.verifyPlacement(placement);
    })
  );

  const ownedPlacements = placements.filter(
    (placement) => placement.placedByOwner
  );
  sendWebhooks(ownedPlacements);

  await prisma.$transaction([
    // Save the processed block
    prisma.serviceState.upsert({
      where: { id: 0 },
      create: { id: 0, lastBlockNumber: blockNumber },
      update: { lastBlockNumber: blockNumber },
    }),

    // Save all new placements.
    ...placements.map((placement) => {
      const dbPlacement = placementToDb(placement);

      // Upsert to make placement events idempotent.
      return prisma.placement.upsert({
        where: {
          blockHash_blockLogIndex: {
            blockHash: placement.blockHash,
            blockLogIndex: placement.blockLogIndex,
          },
        },
        create: dbPlacement,
        update: dbPlacement,
      });
    }),
  ]);

  return fetchSuccessResponse({
    blockNumber,
    events: events.length,
  });
};

const getLastBlockNumberProcessed = async () => {
  const serviceState = await prisma.serviceState.findUnique({
    where: { id: 0 },
  });

  if (!serviceState?.lastBlockNumber) return 0;

  // Add one since the last processed block.
  return serviceState.lastBlockNumber;
};
