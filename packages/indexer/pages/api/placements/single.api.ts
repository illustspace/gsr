// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ApiResponseType, SinglePlacementResponse } from "@gsr/sdk";

import { prisma } from "~/api/db";
import { dbToPlacement } from "~/api/db/dbToPlacement";
import { apiFailure, apiServerFailure, apiSuccess } from "~/api/api-responses";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SinglePlacementResponse>>
) {
  const query = {
    assetType: req.query.assetType,
    chainId: Number(req.query.chainId),
    contractAddress: req.query.contractAddress,
    tokenId: req.query.tokenId,
  };

  try {
    const placement = await prisma.placement.findFirst({
      where: {
        placedByOwner: true,
        decodedAssetId: { equals: query },
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    if (placement) {
      const validatedPlacement = dbToPlacement(placement);
      res.status(200).json(apiSuccess(validatedPlacement));
    } else {
      res.status(404).send(apiFailure("Asset not published", "NO_PLACEMENT"));
    }
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
