// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Wallet } from "@ethersproject/wallet";

import {
  ApiResponseType,
  metaTransactionSchema,
  MetaTransactionExecuteResponse,
} from "@geospatialregistry/sdk";

import { apiFailure, apiServerFailure, apiSuccess } from "~/api/api-responses";
import { gsr } from "~/features/gsr/gsr-contract";
import { getApiEnv } from "~/features/config/apiEnv";
import { prisma } from "~/api/db";

export default async function metaTransactionExecute(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<MetaTransactionExecuteResponse>>
) {
  if (req.method !== "POST") {
    res.status(405).send(apiFailure("Must be a POST", "METHOD_NOT_ALLOWED"));
  }

  try {
    const metaTransaction = metaTransactionSchema.validateSync(req.body);

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

    const tx = await gsr.executeMetaTransaction(signer, metaTransaction, {
      nonce,
    });

    res.status(200).json(apiSuccess({ tx }));
  } catch (error) {
    const { statusCode, body } = apiServerFailure(error);
    res.status(statusCode).send(body);
  }
}
