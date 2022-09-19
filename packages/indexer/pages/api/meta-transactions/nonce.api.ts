import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  MetaTransactionNonceResponse,
} from "@geospatialregistry/sdk";

import { updateMetaTransactionNonce } from "~/api/services/meta-transactions.service";

/** Update the metaTransaction hot wallet's nonce */
export default async function metaTransactionNonce(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<MetaTransactionNonceResponse>>
) {
  const { statusCode, body } = await updateMetaTransactionNonce();

  res.status(statusCode).json(body);
}
