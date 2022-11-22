import { PlacementQueryResponse } from "@geospatialregistry/sdk";

import { getRecentPlacements } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch a list of placements that match a partial DecodedAssetId */
export default wrapServiceEndpoint<PlacementQueryResponse>(async (req, res) => {
  const { statusCode, body } = await getRecentPlacements();

  res.status(statusCode).send(body);
});
