/* eslint-disable no-console */
import { GsrChainId, GsrContract } from "@gsr/sdk";

import { prisma } from "./prisma";

/** Start the indexer when the server starts. */
export const startIndexer = async () => {
  const gsr = new GsrContract(
    {},
    {
      chainId: Number(process.env.GSR_CHAIN_ID) as GsrChainId,
    }
  );

  const sinceBlockNumber = await getLastBlockedProcessed();

  console.log("Starting indexer from block", sinceBlockNumber);

  gsr.watchEvents(
    async (placement) => {
      const placedByOwner = await gsr.verifyPlacement(placement);

      console.log("placement", placement.assetId, placedByOwner);

      const finalPlacement = {
        ...placement,
        placedByOwner,
      };

      // prisma
      return prisma.placement.create({ data: finalPlacement });

      // TODO: Call webhooks
    },
    async (lastBlockNumber: number) => {
      console.log("block", lastBlockNumber);
      const result = await prisma.serviceState.upsert({
        where: { id: 0 },
        create: { id: 0, lastBlockNumber },
        update: { lastBlockNumber },
      });
      console.log("result", result);
    },
    sinceBlockNumber
  );
};

const getLastBlockedProcessed = async () => {
  const serviceState = await prisma.serviceState.findUnique({
    where: { id: 0 },
  });

  if (!serviceState) return undefined;

  return serviceState.lastBlockNumber;
};
