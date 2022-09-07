import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractReceipt } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import {
  bitsToGeohash,
  GsrContract,
  GsrIndexer,
  ValidatedGsrPlacement,
  DecodedAssetId,
  Erc721Verifier,
} from "@gsr/sdk";
import { PlaceOf } from "@gsr/sdk/lib/esm/place";

import { getDefaultProvider, Provider } from "@ethersproject/providers";
import { abi as testTokenAbi } from "../../contracts/artifacts/contracts/test/Erc721.sol/TestToken.json";

const chainId = 1337;

const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const testPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("", () => {
  // let owner1: EthWallet;
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

  beforeAll(() => {
    // owner1 = EthWallet.fromPrivateKey("");
    gsr = new GsrContract(
      {},
      {
        chainId,
      }
    );

    gsrIndexer = new GsrIndexer(1337, { customIndexerUrl: "/api" });

    provider = getDefaultProvider("http://127.0.0.1:8545/");

    signer = new Wallet(testPrivateKey, provider);

    erc721 = new Contract(tokenAddress, testTokenAbi, gsr.gsrProvider);
  });

  beforeEach(async () => {
    await erc721.connect(signer).mint(signer.address, BigNumber.from(1));
  });

  afterEach(async () => {
    await erc721.connect(signer).burn(BigNumber.from(1));
  });

  it("places and indexes", async () => {
    const decodedAssetId: DecodedAssetId = {
      assetType: "ERC721",
      chainId,
      contractAddress: erc721.address,
      tokenId: "1",
    };

    const timeRangeEnd = Math.floor(new Date().getTime() / 1000) + 10_000;

    const tx = await gsr.place(
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

    const placeOf = await gsr.placeOf(decodedAssetId, signer.address);

    const expectedPlaceOf: PlaceOf = {
      bitPrecision: 5,
      geohash: BigNumber.from(0b11111),
      startTime: new Date(timestamp * 1000),
    };
    expect(placeOf).toEqual(expectedPlaceOf);

    await wait(4_000);

    const placement = await gsrIndexer.placeOf(decodedAssetId);

    if (!placement) {
      throw new Error("no indexed placement");
    }

    const expectedResponse: ValidatedGsrPlacement = {
      assetId: new Erc721Verifier({}).hashAssetId(decodedAssetId),
      blockNumber: receipt.blockNumber,
      decodedAssetId,
      geohash: bitsToGeohash(0b11111, 5),
      placedAt: new Date(timestamp * 1000),
      placedByOwner: true,
      published: true,
      publisher: signer.address,
      sceneUri: "https://example.com/scene.json",
      timeRangeEnd: new Date(timeRangeEnd * 1000),
      timeRangeStart: new Date(0),
      parentAssetId:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      tx: tx.hash,
    };

    expect(placement).toEqual(expectedResponse);
  });
});

const wait = (timeout = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
