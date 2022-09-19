import { MetaTransactionExecuteResponse } from "@geospatialregistry/sdk";

import { apiFailure } from "~/api/services/responses/api-responses";
import { executeMetaTransaction } from "~/api/services/meta-transactions.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

export default wrapServiceEndpoint<MetaTransactionExecuteResponse>(
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send(apiFailure("Must be a POST", "METHOD_NOT_ALLOWED"));
    }

    const { statusCode, body } = await executeMetaTransaction(req.body);

    res.status(statusCode).send(body);
  }
);
