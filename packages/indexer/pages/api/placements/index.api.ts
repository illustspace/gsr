import { PlacementQueryResponse } from "@geospatialregistry/sdk";

import { fetchPlacementsByQuery } from "~/api/services/placements.service";
import { wrapServiceEndpoint } from "~/api/services/responses/service-response";

/** Fetch a list of placements that match a partial DecodedAssetId */
export default wrapServiceEndpoint<PlacementQueryResponse>(async (req, res) => {
  const { statusCode, body } = await fetchPlacementsByQuery(req.query);

  res.status(statusCode).send(body);
});
