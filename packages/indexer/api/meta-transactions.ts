import { Wallet } from "@ethersproject/wallet";
import {
  MetaTransaction,
  MetaTransactionExecuteResponse,
  MetaTransactionNonceResponse,
  metaTransactionSchema,
} from "@geospatialregistry/sdk";

import { getApiEnv } from "~/features/config/apiEnv";
import { gsr } from "~/features/gsr/gsr-contract";
import {
  FetchStatusWrapper,
  fetchSuccessResponse,
} from "./api-fetcher-responses";
import { prisma } from "./db";

export const executeMetaTransaction = async (
  metaTransaction: MetaTransaction
): Promise<FetchStatusWrapper<MetaTransactionExecuteResponse>> => {
  const validatedMetaTransaction =
    metaTransactionSchema.validateSync(metaTransaction);

  const signer = new Wallet(
    getApiEnv("metaTransactionRelayPrivateKey"),
    gsr.gsrProvider
  );

  const { nonce } = await prisma.walletNonces.upsert({
    select: { nonce: true },
    create: { address: signer.address, nonce: 0 },
    update: { nonce: { increment: 1 } },
    where: { address: signer.address },
  });

  const tx = await gsr.executeMetaTransaction(
    signer,
    validatedMetaTransaction,
    {
      nonce,
    }
  );

  return fetchSuccessResponse({ tx });
};

export const updateMetaTransactionNonce = async (): Promise<
  FetchStatusWrapper<MetaTransactionNonceResponse>
> => {
  const signer = new Wallet(
    getApiEnv("metaTransactionRelayPrivateKey"),
    gsr.gsrProvider
  );

  // Get the tx count for the hot wallet,
  // and set the nonce to count - 1 to be ready for the next increment
  const lastNonce = (await signer.getTransactionCount()) - 1;
  const address = signer.address;

  await prisma.walletNonces.upsert({
    select: { nonce: true },
    create: { address, nonce: lastNonce },
    update: { nonce: lastNonce },
    where: { address },
  });

  return fetchSuccessResponse({ nonce: lastNonce });
};
