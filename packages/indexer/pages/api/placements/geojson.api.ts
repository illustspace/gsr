import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseError,
  ApiResponseFail,
  PlacementGeoJsonResponse,
} from "@geospatialregistry/sdk";

import { fetchPlacementsAsGeoJson } from "~/api/services/placements.service";
import { fetchCatchResponse } from "~/api/services/responses/service-response";

export default async function placementGeoJson(
  req: NextApiRequest,
  res: NextApiResponse<
    PlacementGeoJsonResponse | ApiResponseFail | ApiResponseError
  >
) {
  const { statusCode, body } = await fetchPlacementsAsGeoJson(req.query).catch(
    fetchCatchResponse
  );

  if (body.status === "success") {
    res.status(statusCode).send(body.data);
  } else {
    res.status(statusCode).send(body);
  }
}
