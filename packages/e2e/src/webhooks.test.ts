import { BigNumber } from "@ethersproject/bignumber";
import {
  MessageAssetId,
  MessageVerifier,
  SerializedGsrPlacement,
} from "@geospatialregistry/sdk";
import axios from "axios";
import { getTimestampOfReceipt, gsr, gsrIndexer, signer } from "./lib/shared";

describe("webhooks", () => {
  it("", async () => {
    const decodedAssetId: MessageAssetId = {
      assetType: "MESSAGE",
      message: "hi",
      publisherAddress: signer.address.toLowerCase(),
    };

    const { tx, sync } = await gsr.place(signer, decodedAssetId, {
      geohash: 0b11111,
      bitPrecision: 5,
    });

    const receipt = await tx.wait();
    const timestamp = await getTimestampOfReceipt(receipt);
    // Wait for the sync to finish, which sends the webhooks.
    await sync;

    const assetId = gsr.getAssetId(decodedAssetId);

    const response = await axios.get<SerializedGsrPlacement>(
      `http://localhost:3001/placements/${assetId}`
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        assetId,
        placedAt: new Date(timestamp).toISOString(),
      })
    );
  });
});
