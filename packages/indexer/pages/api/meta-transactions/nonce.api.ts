// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Wallet } from "@ethersproject/wallet";

import {
  ApiResponseType,
  MetaTransactionNonceResponse,
} from "@geospatialregistry/sdk";

import { apiServerFailure, apiSuccess } from "~/api/api-responses";
import { gsr } from "~/features/gsr/gsr-contract";
import { getApiEnv } from "~/features/config/apiEnv";
import { prisma } from "~/api/db";

export default async function metaTransactionNonce(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<MetaTransactionNonceResponse>>
) {
  try {
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

    res.status(200).json(apiSuccess({ nonce: lastNonce }));
  } catch (error) {
    const { statusCode, body } = apiServerFailure(error);
    res.status(statusCode).send(body);
  }
}
