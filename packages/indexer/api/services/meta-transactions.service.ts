import { Wallet } from "@ethersproject/wallet";
import {
  MetaTransaction,
  MetaTransactionExecuteResponse,
  MetaTransactionNonceResponse,
  metaTransactionSchema,
} from "@geospatialregistry/sdk";

import { getApiEnv } from "~/features/config/apiEnv";
import { gsr } from "~/features/gsr/gsr-contract";
import { prisma } from "~/api/db";
import {
  GsrIndexerServiceWrapper,
  fetchSuccessResponse,
} from "./responses/service-response";

/** Execute a metaTransaction from the stored private key. */
export const executeMetaTransaction = async (
  metaTransaction: MetaTransaction
): Promise<GsrIndexerServiceWrapper<MetaTransactionExecuteResponse>> => {
  const validatedMetaTransaction =
    metaTransactionSchema.validateSync(metaTransaction);

  const signer = new Wallet(
    getApiEnv("metaTransactionRelayPrivateKey"),
    gsr.gsrProvider
  );

  const address = signer.address.toLowerCase();

  // eslint-disable-next-line no-console
  console.log("Relaying metaTransaction", {
    user: metaTransaction.address,
    relayer: address,
  });

  const { nonce } = await prisma.walletNonces.upsert({
    select: { nonce: true },
    create: { address, nonce: 0 },
    update: { nonce: { increment: 1 } },
    where: { address },
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

/** Update the cached metaTransaction private key nonce. */
export const updateMetaTransactionNonce = async (): Promise<
  GsrIndexerServiceWrapper<MetaTransactionNonceResponse>
> => {
  const signer = new Wallet(
    getApiEnv("metaTransactionRelayPrivateKey"),
    gsr.gsrProvider
  );

  // Get the tx count for the hot wallet,
  // and set the nonce to count - 1 to be ready for the next increment
  const lastNonce = (await signer.getTransactionCount()) - 1;
  const address = signer.address.toLowerCase();

  await prisma.walletNonces.upsert({
    create: { address, nonce: lastNonce },
    update: { nonce: lastNonce },
    where: { address },
  });

  return fetchSuccessResponse({ nonce: lastNonce });
};
