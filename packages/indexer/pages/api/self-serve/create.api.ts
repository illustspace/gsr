// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
// import { Storage } from "@google-cloud/storage";

import {
  ApiResponseType,
  SelfServeCreateResponse,
  SelfPublishedVerifier,
} from "@gsr/sdk";

import { prisma } from "~/api/db";
import { apiServerFailure, apiSuccess } from "~/api/api-responses";

export default async function selfServeCreate(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseType<SelfServeCreateResponse>>
) {
  if (req.method !== "POST") {
    res.status(404).send(apiServerFailure("Not found"));
    return;
  }

  const { name, publisher, description, message } = req.body;

  const assetId = new SelfPublishedVerifier({}).hashAssetId({
    assetType: "SELF_PUBLISHED",
    assetHash: message,
    // TODO: Signature verification
    publisherAddress: publisher,
  });

  // TODO: Use a resumable upload to upload the file to GCS.
  // const storage = new Storage();
  // const bucket = storage.bucket("my-bucket");
  // const file = bucket.file(`self-serve/${publisher.toLowerCase()}/${assetId}`);
  // file.createResumableUpload().then(function(data) {
  //   // Send this to the client to upload the file.
  //   const uri = data[0];
  // });

  try {
    await prisma.selfServeAsset.create({
      data: {
        assetId,
        publisher,
        name,
        description,
        message,
      },
    });

    // TODO: get host url from env
    const sceneUri = `/api/self-serve/metadata/${assetId}`;

    res.status(201).json(apiSuccess({ assetId, sceneUri }));
  } catch (error) {
    res.status(500).send(apiServerFailure(error));
  }
}
