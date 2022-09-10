// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  SinglePlacementResponse,
} from "@geospatialregistry/sdk";

import { prisma } from "~/api/db";
import { dbToPlacement } from "~/api/db/dbToPlacement";
import { apiFailure, apiServerFailure, apiSuccess } from "~/api/api-responses";
import { gsr } from "~/features/gsr/gsr-contract";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SinglePlacementResponse>>
) {
  const query = gsr.parseAssetId(req.query);

  const publisher = (req.query.publisher as string)?.toLowerCase();

  try {
    const placement = await prisma.placement.findFirst({
      where: {
        // Filter by valid placements, unless a publisher is specified.
        placedByOwner: !publisher,
        decodedAssetId: { equals: query },
        publisher: publisher || undefined,
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    // 404 if the placement doesn't exist or was un-published.
    if (!placement?.published) {
      res.status(404).send(apiFailure("Asset not published", "NO_PLACEMENT"));
      return;
    }

    const validatedPlacement = dbToPlacement(placement);
    res.status(200).json(apiSuccess(validatedPlacement));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
