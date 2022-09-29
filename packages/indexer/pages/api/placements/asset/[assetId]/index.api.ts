import { SinglePlacementResponse } from "@geospatialregistry/sdk";

import { getPlacementByAssetId } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/**
 * Fetch the latest placement by assetId
 */
export default wrapServiceEndpoint<SinglePlacementResponse>(
  async (req, res) => {
    const assetId = req.query.assetId as string;
    const publisher = req.query.publisher as string;

    const { statusCode, body } = await getPlacementByAssetId(
      assetId,
      publisher
    );

    res.status(statusCode).send(body);
  }
);
