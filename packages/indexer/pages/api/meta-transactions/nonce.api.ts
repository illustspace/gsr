import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  MetaTransactionNonceResponse,
} from "@geospatialregistry/sdk";

import { updateMetaTransactionNonce } from "~/api/meta-transactions";
import { fetchCatchResponse } from "~/api/api-fetcher-responses";

/** Update the metaTransaction hot wallet's nonc nf */
export default async function metaTransactionNonce(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<MetaTransactionNonceResponse>>
) {
  const { statusCode, body } = await updateMetaTransactionNonce().catch(
    fetchCatchResponse
  );

  res.status(statusCode).json(body);
}
