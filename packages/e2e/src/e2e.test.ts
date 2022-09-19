import { BigNumber } from "@ethersproject/bignumber";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

import {
  Erc721Verifier,
  Erc721AssetId,
  SelfPublishedAssetId,
  SelfPublishedVerifier,
  MessageAssetId,
  MessageVerifier,
} from "@geospatialregistry/sdk";

import {
  gsr,
  chainId,
  gsrIndexer,
  getTimestampOfReceipt,
  erc721,
  signer,
} from "./lib/shared";

describe("e2e", () => {
  describe("ERC721 Assets", () => {
    it("places and indexes", async () => {
      const mintTx = await erc721
        .connect(signer)
        .mint(signer.address, BigNumber.from(1));
      await mintTx.wait();

      const decodedAssetId: Erc721AssetId = {
        assetType: "ERC721",
        chainId,
        contractAddress: erc721.address,
        tokenId: "1",
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
      const timestamp = await getTimestampOfReceipt(receipt);
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: new Date(timestamp * 1000),
      });

      // Test placement made it to the indexer
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual({
        assetId: new Erc721Verifier({}).hashAssetId(decodedAssetId),
        blockNumber: receipt.blockNumber,
        decodedAssetId: {
          ...decodedAssetId,
          contractAddress: decodedAssetId.contractAddress.toLowerCase(),
        },
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: new Date(timestamp * 1000),
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
      });

      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });

    it("places and indexes with metaTransaction", async () => {
      const mintTx = await erc721
        .connect(signer)
        .mint(signer.address, BigNumber.from(2));
      await mintTx.wait();

      const decodedAssetId: Erc721AssetId = {
        assetType: "ERC721",
        chainId,
        contractAddress: erc721.address,
        tokenId: "2",
      };

      const timeRangeEnd = Math.floor(new Date().getTime() / 1000) + 10_000;

      // Sign a metaTransaction with signer1
      const metaTx = await gsr.placeWithMetaTransaction(
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

      // Submit the metaTx with signer2
      const txHash = await gsrIndexer.executeMetaTransaction(metaTx);

      const { tx, sync } = await gsr.syncAfterTransactionHash(txHash);

      const receipt = await tx.wait();
      const timestamp = await getTimestampOfReceipt(receipt);
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: new Date(timestamp * 1000),
      });

      // Test placement made it to the indexer, and that it reads as placed by signer1
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual({
        assetId: new Erc721Verifier({}).hashAssetId(decodedAssetId),
        blockNumber: receipt.blockNumber,
        decodedAssetId: {
          ...decodedAssetId,
          contractAddress: decodedAssetId.contractAddress.toLowerCase(),
        },
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: new Date(timestamp * 1000),
        placedByOwner: true,
        published: true,
        // Signer1, even though signer2 submitted the TX
        publisher: signer.address.toLowerCase(),
        sceneUri: "https://example.com/scene.json",
        timeRange: {
          start: null,
          end: new Date(timeRangeEnd * 1000),
        },
        parentAssetId: null,
        tx: tx.hash,
      });

      // Nothing more to sync
      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });
  });

  describe("Message Assets", () => {
    it("places and indexes", async () => {
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
      const timestamp = await getTimestampOfReceipt(receipt);
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: new Date(timestamp * 1000),
      });

      // Test placement made it to the indexer
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual({
        assetId: new MessageVerifier({}).hashAssetId(decodedAssetId),
        blockNumber: receipt.blockNumber,
        decodedAssetId,
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: new Date(timestamp * 1000),
        placedByOwner: true,
        published: true,
        publisher: signer.address.toLowerCase(),
        sceneUri: null,
        timeRange: {
          start: null,
          end: null,
        },
        parentAssetId: null,
        tx: tx.hash,
      });

      // Nothing more to sync
      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });
  });

  describe("Message Assets", () => {
    it("places and indexes", async () => {
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
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: new Date(timestamp * 1000),
      });

      // Test placement made it to the indexer
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual({
        assetId: new MessageVerifier({}).hashAssetId(decodedAssetId),
        blockNumber: receipt.blockNumber,
        decodedAssetId,
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: new Date(timestamp * 1000),
        placedByOwner: true,
        published: true,
        publisher: signer.address.toLowerCase(),
        sceneUri: null,
        timeRange: {
          start: null,
          end: null,
        },
        parentAssetId: null,
        tx: tx.hash,
      });

      // Nothing more to sync
      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });
  });

  describe("SelfPublished Assets", () => {
    it("places and indexes", async () => {
      const decodedAssetId: SelfPublishedAssetId = {
        assetType: "SELF_PUBLISHED",
        assetHash: keccak256(toUtf8Bytes("test")),
        publisherAddress: signer.address.toLowerCase(),
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
      const timestamp = await getTimestampOfReceipt(receipt);
      // Wait for the sync to finish.
      await sync;

      // Test contract.placeOf
      expect(await gsr.placeOf(decodedAssetId, signer.address)).toEqual({
        bitPrecision: 5,
        geohash: BigNumber.from(0b11111),
        startTime: new Date(timestamp * 1000),
      });

      // Test placement made it to the indexer
      expect(await gsrIndexer.placeOf(decodedAssetId)).toEqual({
        assetId: new SelfPublishedVerifier({}).hashAssetId(decodedAssetId),
        blockNumber: receipt.blockNumber,
        decodedAssetId,
        location: {
          geohash: 0b11111,
          bitPrecision: 5,
        },
        placedAt: new Date(timestamp * 1000),
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
      });

      // Nothing more to sync
      expect(await gsrIndexer.sync()).toEqual({
        blockNumber: receipt.blockNumber,
        events: 0,
      });
    });
  });
});
