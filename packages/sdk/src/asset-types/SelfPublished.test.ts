import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

import { GsrPlacement } from "~/placement-event";

import { SelfPublishedAssetId, SelfPublishedVerifier } from "./SelfPublished";

const publisher = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const notPublisher = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const decodedAssetId: SelfPublishedAssetId = {
  assetType: "SELF_PUBLISHED",
  publisherAddress: publisher,
  assetHash: keccak256(toUtf8Bytes("hello")),
};

describe("SelfPublishedVerifier", () => {
  let verifier: SelfPublishedVerifier;

  beforeEach(() => {
    verifier = new SelfPublishedVerifier({});
  });

  it("returns true if the previous publisher is the publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        publisher,
      } as GsrPlacement<SelfPublishedAssetId>)
    ).toBe(true);
  });

  it("returns false if the previous publisher is not publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        // Pass a different publisher than the return from ownerOf
        publisher: notPublisher,
      } as GsrPlacement<SelfPublishedAssetId>)
    ).toBe(false);
  });
});
