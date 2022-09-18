import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractReceipt } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import axios from "axios";

import {
  GsrContract,
  GsrIndexer,
  Erc721Verifier,
  Erc721AssetId,
  SelfPublishedAssetId,
  SelfPublishedVerifier,
} from "@geospatialregistry/sdk";

import { getDefaultProvider, Provider } from "@ethersproject/providers";
import { abi as testTokenAbi } from "./artifacts/contracts/test/Erc721.sol/TestToken.json";
import { prisma } from "../../indexer/api/db";

process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/gsr";

const chainId = 1337;

const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const testPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("e2e", () => {
  let gsr: GsrContract;
  let gsrIndexer: GsrIndexer;
  let signer: Wallet;
  let provider: Provider;
  let erc721: Contract;

  const getTimestampOfReceipt = async (receipt: ContractReceipt) => {
    const { blockHash } = receipt;
    const block = await gsr.gsrProvider.getBlock(blockHash);
    return block.timestamp;
  };

  beforeAll(async () => {
    await resetDb();

    gsrIndexer = new GsrIndexer(1337, {
      customIndexerUrl: "http://localhost:3001/api",
    });
    // owner1 = EthWallet.fromPrivateKey("");
    gsr = new GsrContract(
      {},
      {
        chainId,
        indexer: gsrIndexer,
      }
    );

    provider = getDefaultProvider("http://127.0.0.1:8545/");

    signer = new Wallet(testPrivateKey, provider);

    erc721 = new Contract(tokenAddress, testTokenAbi, gsr.gsrProvider);

    // Sync the nonce with the blockchain
    await axios.post("http://localhost:3001/api/meta-transactions/nonce");
  });

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

const resetDb = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  await Promise.all(
    tablenames.map(({ tablename }) => {
      if (tablename !== "_prisma_migrations") {
        return prisma
          .$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
          .catch(console.error);
      }

      return null;
    })
  );
};
