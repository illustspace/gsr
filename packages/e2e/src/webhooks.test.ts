import {
  MessageAssetId,
  SerializedGsrPlacement,
} from "@geospatialregistry/sdk";
import axios from "axios";

import { prisma } from "../../indexer/api/db";

import { getTimestampDateOfReceipt, gsr, signer } from "./lib/shared";

describe("webhooks", () => {
  beforeAll(async () => {
    // Set up a webhook to the example server.
    await prisma.webhook.create({
      data: {
        active: true,
        endpoint: "http://localhost:3002/gsr/webhook",
      },
    });
  });

  it("receives a webhook", async () => {
    const decodedAssetId: MessageAssetId = {
      assetType: "MESSAGE",
      message: "hi",
      publisherAddress: signer.address.toLowerCase(),
      placementNumber: 1,
    };

    const { tx, sync } = await gsr.place(signer, decodedAssetId, {
      geohash: 0b11111,
      bitPrecision: 5,
    });

    const receipt = await tx.wait();
    const timestamp = await getTimestampDateOfReceipt(receipt);
    // Wait for the sync to finish, which sends the webhooks.
    await sync;

    const assetId = gsr.getAssetId(decodedAssetId);

    const response = await axios.get<SerializedGsrPlacement>(
      `http://localhost:3002/placements/${assetId}`
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        assetId,
        placedAt: timestamp.toISOString(),
      })
    );
  });
});
