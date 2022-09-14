import { BigNumber } from "@ethersproject/bignumber";
import { encode_int } from "ngeohash";
import { Erc721AssetId, Erc721Verifier } from "./asset-types";
import { decodeGsrPlacementEvent, GsrPlacement } from "./placement-event";
import { GsrPlacementEvent } from "./typechain/GeoSpatialRegistry";

const venice = { latitude: 33.98767333380228, longitude: -118.47232098946658 };

const bitPrecision = 6 * 5;
const geohash = encode_int(venice.latitude, venice.longitude, bitPrecision);

describe("placement-event", () => {
  it("decodes a placement event", () => {
    const verifier = new Erc721Verifier({});

    const contractPlacementEvent = {
      transactionHash: "0x123",
      blockNumber: 5,
      args: {
        assetId:
          "0x2f08d2a12ba7681d94915bad05b421a5ae23244ad36c7d4a71086a50e2748475",
        parentAssetId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        collectionIdHash:
          "0x42da5ea0fe1a4bc51eab7203974438a063d8c1094592e7190fb5e3599a50f02e",
        fullAssetId: {
          assetType:
            "0x73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a",
          collectionId:
            "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          itemId:
            "0x00000000000000000000000000000000000000000000000000000000000019bc",
        },
        publisher: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        published: true,
        geohash: {
          geohash: BigNumber.from(geohash),
          bitPrecision: BigNumber.from(30),
        },
        sceneUri: "",
        placedAt: BigNumber.from(1640995200),
        timeRange: { start: BigNumber.from(0), end: BigNumber.from(0) },
      },
    } as unknown as GsrPlacementEvent;

    const expectedPlacement: GsrPlacement<Erc721AssetId> = {
      assetId:
        "0x2f08d2a12ba7681d94915bad05b421a5ae23244ad36c7d4a71086a50e2748475",
      parentAssetId: null,
      decodedAssetId: {
        assetType: "ERC721",
        chainId: 1,
        contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        tokenId: "6588",
      },
      publisher: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
      published: true,
      location: {
        geohash,
        bitPrecision,
      },
      sceneUri: null,
      placedAt: new Date("2022-01-01T00:00:00.000Z"),
      timeRange: {
        start: null,
        end: null,
      },
      blockNumber: 5,
      tx: "0x123",
    };

    expect(decodeGsrPlacementEvent(contractPlacementEvent, verifier)).toEqual(
      expectedPlacement
    );
  });
});
