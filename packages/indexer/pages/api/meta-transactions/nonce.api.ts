import { MetaTransactionNonceResponse } from "@geospatialregistry/sdk";

import { updateMetaTransactionNonce } from "~/api/services/meta-transactions.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/**
 * Update the metaTransaction hot wallet's nonce
 * @route /api/meta-transactions/nonce
 */
export default wrapServiceEndpoint<MetaTransactionNonceResponse>(
  async (_req, res) => {
    const { statusCode, body } = await updateMetaTransactionNonce();

    res.status(statusCode).json(body);
  }
);
