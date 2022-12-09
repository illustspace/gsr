import * as fa2Helpers from "./helpers/Tezos";

import { GsrPlacement } from "~/placement-event";
import { Fa2AssetId, Fa2Verifier } from "./FA2";

const publisher = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const notPublisher = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const decodedAssetId: Fa2AssetId = {
  assetType: "FA2",
  chainId: "ghostnet",
  contractAddress: "KT1ACTjebZPDFCvEbDHfiim4go22Dc6M5ARh",
  tokenId: "2",
  publisherAddress: "tz1dXG9VJxQAphGEZLKiqUbLQwt2HxTARfaM",
  itemNumber: "1",
};

describe("FA2", () => {
  let verifier: Fa2Verifier;

  beforeEach(() => {
    verifier = new Fa2Verifier();
    jest.spyOn(fa2Helpers, "verifyAliasAddress").mockResolvedValue();
    jest.spyOn(fa2Helpers, "verifyBalance").mockResolvedValue();
  });

  it("returns true if the owner is the publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        publisher,
      } as GsrPlacement<Fa2AssetId>)
    ).toBe(true);
  });

  it("returns false if the owner is not an alias", async () => {
    jest.spyOn(fa2Helpers, "verifyAliasAddress").mockRejectedValue(undefined);

    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        // Pass a different publisher than the return from ownerOf
        publisher: notPublisher,
      } as GsrPlacement<Fa2AssetId>)
    ).toBe(false);
  });
});
