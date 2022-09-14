// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  PlacementGeoJsonResponse,
} from "@geospatialregistry/sdk";

import { prisma } from "~/api/db";
import { apiServerFailure, apiSuccess } from "~/api/api-responses";
import { placementsToGeoJson } from "~/features/map/geo-json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<PlacementGeoJsonResponse>>
) {
  const query = {
    assetType: req.query.assetType,
    chainId: req.query.chainId ? Number(req.query.chainId) : undefined,
    contractAddress: req.query.contractAddress,
    tokenId: req.query.tokenId,
  };

  try {
    const placements = await prisma.placement.findMany({
      // Get assets that match the query.
      where: {
        placedByOwner: true,
        decodedAssetId: { equals: query },
      },
      // Only return return the latest placement for the asset.
      distinct: ["assetId"],
      orderBy: {
        placedAt: "desc",
      },
    });

    const geojson = placementsToGeoJson(placements);

    res.status(200).json(apiSuccess(geojson));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
