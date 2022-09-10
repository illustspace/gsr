import * as contracts from "@ethersproject/contracts";

import { GsrPlacement } from "~/placement-event";

import { Erc721AssetId, Erc721Verifier } from "./ERC721";

const publisher = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const notPublisher = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const decodedAssetId: Erc721AssetId = {
  assetType: "ERC721",
  chainId: 1337,
  contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  tokenId: "6588",
};

describe("ERC721", () => {
  let verifier: Erc721Verifier;

  beforeEach(() => {
    verifier = new Erc721Verifier({});

    jest.spyOn(contracts, "Contract").mockReturnValue({
      ownerOf: jest.fn().mockResolvedValue(publisher),
    } as any);
  });

  it("returns true if the owner is the publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        publisher,
      } as GsrPlacement<Erc721AssetId>)
    ).toBe(true);
  });

  it("returns false if the owner is not publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        // Pass a different publisher than the return from ownerOf
        publisher: notPublisher,
      } as GsrPlacement<Erc721AssetId>)
    ).toBe(false);
  });
});
