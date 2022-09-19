import { IndexerSyncResponse } from "@geospatialregistry/sdk";
import { gsr } from "~/features/gsr/gsr-contract";
import {
  FetchStatusWrapper,
  fetchSuccessResponse,
} from "./responses/api-fetcher-responses";
import { prisma } from "./db";
import { placementToDb } from "./db/dbToPlacement";
import { sendWebhooks } from "./webhooks/send-webhooks";

export const syncIndexer = async (): Promise<
  FetchStatusWrapper<IndexerSyncResponse>
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
      // todo: transaction
      return prisma.placement.create({ data: placementToDb(placement) });
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
