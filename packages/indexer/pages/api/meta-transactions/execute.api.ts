// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  MetaTransactionExecuteResponse,
} from "@geospatialregistry/sdk";

import { apiFailure } from "~/api/responses/api-responses";
import { executeMetaTransaction } from "~/api/meta-transactions";
import { fetchCatchResponse } from "~/api/responses/api-fetcher-responses";

export default async function metaTransactionExecute(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<MetaTransactionExecuteResponse>>
) {
  if (req.method !== "POST") {
    res.status(405).send(apiFailure("Must be a POST", "METHOD_NOT_ALLOWED"));
  }

  const { statusCode, body } = await executeMetaTransaction(req.body).catch(
    fetchCatchResponse
  );

  res.status(statusCode).send(body);
}
