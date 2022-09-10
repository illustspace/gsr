/**
 * Test encoding/decoding of asset types
 */

import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { DecodedAssetId } from "./AssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { Erc1155Verifier } from "./ERC1155";
import { Erc721Verifier } from "./ERC721";
import { SelfPublishedVerifier } from "./SelfPublished";

interface TestCase<T extends DecodedAssetId> {
  decodedAssetId: T;
  verifier: BaseAssetTypeVerifier<T>;
  encodedAssetId: EncodedAssetId;
  assetId: string;
}

/** Test cases for each asset type  */
const testCases: TestCase<DecodedAssetId>[] = [
  {
    decodedAssetId: {
      assetType: "ERC721",
      chainId: 1,
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      tokenId: "6588",
    },
    encodedAssetId: {
      assetType:
        "0x73ad2146b3d3a286642c794379d750360a2d53a3459a11b3e5d6cc900f55f44a",
      collectionId:
        "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      itemId:
        "0x00000000000000000000000000000000000000000000000000000000000019bc",
    },
    verifier: new Erc721Verifier({}),
    assetId:
      "0x2f08d2a12ba7681d94915bad05b421a5ae23244ad36c7d4a71086a50e2748475",
  },
  {
    decodedAssetId: {
      assetType: "ERC1155",
      chainId: 1,
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      tokenId: "6588",
      itemNumber: "1",
      publisherAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    encodedAssetId: {
      assetType:
        "0x973bb64086f173ec8099b7ed3d43da984f4a332e4417a08bc6a286e6402b0586",
      collectionId:
        "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bc4ca0eda7647a8ab7c2061c2e118a18a936f13d00000000000000000000000000000000000000000000000000000000000019bc",
      itemId:
        "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000001",
    },
    verifier: new Erc1155Verifier({}),
    assetId:
      "0xc57a68fcd72568451f71e2a1880ac40fd608b31aba057a4e111787ee1d10ff37",
  },
  {
    decodedAssetId: {
      assetType: "SELF_PUBLISHED",
      assetHash: keccak256(toUtf8Bytes("hello world")),
      publisherAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    encodedAssetId: {
      assetType:
        "0x6f33951b03da53d1dd917f8a92b93a7136428ded8a66a4b8d19686d5ad1aa638",
      collectionId:
        "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad",
      itemId:
        "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    verifier: new SelfPublishedVerifier({}),
    assetId:
      "0x6ba43fbd5da0c9fc9bca252ec8bb06c2fdbf238d7903dc0856ef44f8a15283b4",
  },
];

describe("asset type encoding/decoding", () => {
  describe.each(testCases)(
    "$decodedAssetId.assetType",
    ({ decodedAssetId, encodedAssetId, verifier, assetId }) => {
      it("encodes an decodedAssetId", () => {
        expect(verifier.encodeAssetId(decodedAssetId)).toEqual(encodedAssetId);
      });

      it("decodes an encodedAssetId", () => {
        expect(verifier.decodeAssetId(encodedAssetId)).toEqual(decodedAssetId);
      });

      it("hashes an decodedAssetId", () => {
        expect(verifier.hashAssetId(decodedAssetId)).toEqual(assetId);
      });

      it("has the expected encodedAssetType", () => {
        expect(verifier.encodedAssetType).toEqual(encodedAssetId.assetType);
      });
    }
  );
});
