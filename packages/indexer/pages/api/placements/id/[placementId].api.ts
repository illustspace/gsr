import { SinglePlacementResponse } from "@geospatialregistry/sdk";

import { getPlacementByPlacementId } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/**
 * Fetch the latest placement by assetId
 */
export default wrapServiceEndpoint<SinglePlacementResponse>(
  async (req, res) => {
    const placementId = req.query.placementId as string;

    const { statusCode, body } = await getPlacementByPlacementId(placementId);

    res.status(statusCode).send(body);
  }
);
