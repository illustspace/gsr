import { BigNumber } from "@ethersproject/bignumber";

import { Fa2AssetId } from "@geospatialregistry/sdk";

import { gsr, getTimestampDateOfReceipt, signer } from "../lib/shared";

describe("e2e", () => {
  describe("Tezos Assets", () => {
    jest.setTimeout(20000);
    it("places and indexes", async () => {
      const decodedAssetId: Fa2AssetId = {
        assetType: "FA2",
        chainId: "mainnet",
        contractAddress: "KT1Fk4pZAXDgLwzahLnrZwTRgKWd5Nc4RoTX",
        tokenId: "2",
        publisherAddress: "tz1dXG9VJxQAphGEZLKiqUbLQwt2HxTARfaM",
        itemNumber: "1",
      };
      const timeRangeEnd = Math.floor(new Date().getTime() / 1000) + 10_000;

      const { tx, sync } = await gsr.place(
        signer,
        decodedAssetId,
        {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        {
          sceneUri: "https://example.com/scene.json",
          timeRange: {
            start: 0,
            end: timeRangeEnd,
          },
        }
      );

      const receipt = await tx.wait();
      // Wait for the sync to finish.
      await sync;
      const timestamp = await getTimestampDateOfReceipt(receipt);

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: timestamp,
      });
    });
  });
});
