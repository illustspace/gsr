import { SinglePlacementResponse } from "@geospatialregistry/sdk";

import { fetchPlacementByQuery } from "~/api/services/placements.service";
import { apiFailure } from "~/api/services/responses/api-responses";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch the latest placement by decodedAssetId */
export default wrapServiceEndpoint<SinglePlacementResponse>(
  async (req, res) => {
    if (req.method !== "POST") {
      res
        .status(405)
        .json(apiFailure("Method not allowed", "METHOD_NOT_ALLOWED"));
      return;
    }

    const { decodedAssetId, publisher } = req.body;

    const { statusCode, body } = await fetchPlacementByQuery(
      decodedAssetId,
      publisher
    );

    res.status(statusCode).send(body);
  }
);
