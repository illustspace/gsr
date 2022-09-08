// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ApiResponseType,
  GsrSceneMetadata,
  SelfServeMetadataResponse,
} from "@gsr/sdk";

import { prisma } from "~/api/db";
import { apiFailure, apiServerFailure, apiSuccess } from "~/api/api-responses";

export default async function selfServeCreate(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SelfServeMetadataResponse>>
) {
  const assetId = req.query.assetId as string;

  try {
    const asset = await prisma.selfServeAsset.findUnique({
      where: { assetId },
    });

    if (!asset) {
      res
        .status(404)
        .send(apiFailure(`Asset ${assetId} not found`, "ASSET_NOT_FOUND"));
      return;
    }

    const metadata: GsrSceneMetadata = {
      name: asset.name,
    };

    if (asset.description) {
      metadata.description = asset.description;
    }

    if (asset.imageUrl) {
      metadata.image = asset.imageUrl;
    }

    if (asset.message) {
      metadata.content ??= {};
      metadata.content.message = asset.message;
    }

    res.status(200).send(apiSuccess(metadata));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
