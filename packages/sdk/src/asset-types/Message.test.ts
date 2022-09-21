import { GsrPlacement } from "~/placement-event";

import { MessageAssetId, MessageVerifier } from "./Message";

const publisher = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const notPublisher = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const decodedAssetId: MessageAssetId = {
  assetType: "MESSAGE",
  publisherAddress: publisher,
  message: "hello",
  placementNumber: 1,
};

describe("MessageVerifier", () => {
  let verifier: MessageVerifier;

  beforeEach(() => {
    verifier = new MessageVerifier({});
  });

  it("returns true if the previous publisher is the publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        publisher,
      } as GsrPlacement<MessageAssetId>)
    ).toBe(true);
  });

  it("returns false if the previous publisher is not publisher", async () => {
    expect(
      await verifier.verifyAssetOwnership({
        decodedAssetId,
        // Pass a different publisher than the return from ownerOf
        publisher: notPublisher,
      } as GsrPlacement<MessageAssetId>)
    ).toBe(false);
  });
});
