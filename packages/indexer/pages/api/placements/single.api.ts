import { SinglePlacementResponse } from "@geospatialregistry/sdk";

import { fetchPlacementByQuery } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch the latest placement by decodedAssetId */
export default wrapServiceEndpoint<SinglePlacementResponse>(
  async (req, res) => {
    const { statusCode, body } = await fetchPlacementByQuery(req.query);

    res.status(statusCode).send(body);
  }
);
