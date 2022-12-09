import { BigNumber } from "@ethersproject/bignumber";

import {
  Fa2AssetId,
  Fa2Verifier,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

import {
  gsr,
  getTimestampDateOfReceipt,
  signer,
  gsrIndexer,
} from "../lib/shared";

describe("e2e", () => {
  describe("Fa2 Assets", () => {
    jest.setTimeout(20000);
    it("places and indexes", async () => {
      const decodedAssetId: Fa2AssetId = {
        assetType: "FA2",
        chainId: "ghostnet",
        contractAddress: "KT1ACTjebZPDFCvEbDHfiim4go22Dc6M5ARh",
        tokenId: "7",
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
      const timestamp = await getTimestampDateOfReceipt(receipt);
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: timestamp,
      });

      const expectedPlacement: ValidatedGsrPlacement = {
        assetId: new Fa2Verifier().hashAssetId(decodedAssetId),
        blockHash: receipt.blockHash,
        blockLogIndex: 0,
        decodedAssetId: {
          ...decodedAssetId,
          contractAddress: decodedAssetId.contractAddress,
        },
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: timestamp,
        placedByOwner: true,
        published: true,
        publisher: signer.address.toLowerCase(),
        sceneUri: "https://example.com/scene.json",
        timeRange: {
          start: null,
          end: new Date(timeRangeEnd * 1000),
        },
        parentAssetId: null,
        tx: tx.hash,
      };

      // Test placement made it to the indexer
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual(
        expectedPlacement
      );

      // Test placement by publisher
      expect(await gsrIndexer.placeOf(decodedAssetId, signer.address)).toEqual(
        expectedPlacement
      );

      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });
  });
});
