import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
import { defaultAbiCoder } from "@ethersproject/abi";

import { ProviderKeys } from "~/provider";

import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { EncodedAssetId } from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

/** Decoded AssetId for an EVM ERC 1155 1:1 NFT */
export type Fa2AssetId = {
  assetType: "FA2";
  chainId: number;
  contractAddress: string;
  tokenId: string;
};

const tezosService = keccak256(toUtf8Bytes("TEZOS"));

export class Fa2Verifier extends BaseAssetTypeVerifier<Fa2AssetId> {
  single = false;
  assetType = "FA2" as const;

  constructor(private providerKeys: ProviderKeys) {
    super();
  }

  decodeAssetId(_assetId: EncodedAssetId): Fa2AssetId {
    return {
      assetType: this.assetType,
      chainId: 1,
      contractAddress: "TODO",
      tokenId: "TODO",
    };
  }

  encodeAssetId(_assetId: Fa2AssetId) {
    return {
      assetType: this.encodedAssetType,
      collectionId: "TODO",
      itemId: "TODO",
    };
  }

  async verifyAssetOwnership(
    placement: GsrPlacement<Fa2AssetId>
  ): Promise<boolean> {
    if (!placement.linkedAccount) return false;

    const [linkedService, linkedAccount] = defaultAbiCoder.decode(
      ["bytes32", "bytes"],
      placement.linkedAccount
    );

    if (linkedService !== tezosService) return false;

    const tezosAddress = toUtf8String(linkedAccount);
    // eslint-disable-next-line no-console
    console.log(tezosAddress);

    // TODO: get the proof from the ALR and verify the signature against the tezosAddress

    // TODO: verify the actual ownership of the asset on Tezos
    throw new Error("not implemented");
  }
}
