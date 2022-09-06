/* eslint-disable no-console */
import { GsrChainId, GsrContract } from "@gsr/sdk";
import { prisma } from "@gsr/db";

/** Start the indexer when the server starts. */
export const startIndexer = async () => {
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

  console.log("Starting indexer from block", sinceBlockNumber);

  gsr.watchEvents(
    async (placement) => {
      const finalPlacement = await gsr.verifyPlacement(placement);

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

startIndexer();
