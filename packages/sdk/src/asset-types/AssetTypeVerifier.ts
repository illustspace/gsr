import { ProviderKeys } from "~/provider";

import { Erc721AssetId, Erc721Verifier } from "./ERC721";
import { Erc1155AssetId, Erc1155Verifier } from "./ERC1155";
import { Fa2Verifier, Fa2AssetId } from "./FA2";
import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import {
  AssetTypeVerifierMethods,
  EncodedAssetId,
} from "./AssetTypeVerifierMethods";
import { GsrPlacement } from "~/placement-event";

/** Add Verifiers here to make them available for use */
const verifierClasses = [Erc721Verifier, Erc1155Verifier, Fa2Verifier];

export type DecodedAssetId = Erc721AssetId | Erc1155AssetId | Fa2AssetId;
export type DecodedAssetType = DecodedAssetId["assetType"];

/**
 * Proxy for picking a verifier based on the assetType, and using
 * it to encode, decode, and verify assets.
 */
export class AssetTypeVerifier extends AssetTypeVerifierMethods {
  verifiers: Record<string, BaseAssetTypeVerifier> = {};
  decodedAssetTypes: Record<string, string> = {};

  constructor(
    /** API Keys for data sources used to fetch asset data */
    providerKeys: ProviderKeys
  ) {
    super();
    this.setupVerifiers(providerKeys);
  }

  decodeAssetId(encodedAssetId: EncodedAssetId): DecodedAssetId {
    const verifier = this.getVerifierFromEncoded(encodedAssetId);

    // TODO: Verify and throw error if bad
    return verifier.decodeAssetId(encodedAssetId) as DecodedAssetId;
  }

  encodeAssetId(assetId: DecodedAssetId): EncodedAssetId {
    const verifier = this.getVerifier(assetId.assetType);

    return verifier.encodeAssetId(assetId);
  }

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  hashAssetId(decodedAssetId: DecodedAssetId): string {
    const verifier = this.getVerifier(decodedAssetId.assetType);
    return verifier.hashAssetId(decodedAssetId);
  }

  /** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
  hashEncodedAssetId(encodedAssetId: EncodedAssetId): string {
    const verifier = this.getVerifierFromEncoded(encodedAssetId);
    return verifier.hashEncodedAssetId(encodedAssetId);
  }

  verifyAssetOwnership(placement: GsrPlacement): Promise<boolean> {
    const verifier = this.getVerifier(placement.decodedAssetId.assetType);
    return verifier.verifyAssetOwnership(placement);
  }

  private getVerifier(
    decodedAssetType: DecodedAssetType
  ): BaseAssetTypeVerifier {
    return this.verifiers[decodedAssetType];
  }

  private getVerifierFromEncoded(
    encodedAssetId: EncodedAssetId
  ): BaseAssetTypeVerifier {
    const assetType = this.decodedAssetTypes[encodedAssetId.assetType];

    if (!assetType) {
      throw new Error(
        `Unknown encoded asset type: ${encodedAssetId.assetType}`
      );
    }

    return this.verifiers[assetType];
  }

  private setupVerifiers(providerKeys: ProviderKeys) {
    verifierClasses.forEach((Verifier) => {
      const verifier = new Verifier(providerKeys);

      // eslint-disable-next-line no-param-reassign
      this.verifiers[verifier.assetType] = verifier;
      this.decodedAssetTypes[verifier.encodedAssetType] = verifier.assetType;
    });
  }
}
