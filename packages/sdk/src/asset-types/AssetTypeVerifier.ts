import { GsrPlacement } from "~/placement-event";
import { ProviderKeys } from "~/provider";

import {
  AssetTypeVerifierMethods,
  EncodedAssetId,
} from "./AssetTypeVerifierMethods";
import { BaseAssetTypeVerifier } from "./BaseAssetTypeVerifier";
import { Erc1155AssetId, Erc1155Verifier } from "./ERC1155";
import { Erc721AssetId, Erc721Verifier } from "./ERC721";
import { Fa2Verifier, Fa2AssetId } from "./FA2";
import { MessageAssetId, MessageVerifier } from "./Message";
import { SelfPublishedAssetId, SelfPublishedVerifier } from "./SelfPublished";

/** Add Verifiers here to make them available for use */
export const verifierClasses = [
  Erc721Verifier,
  Erc1155Verifier,
  Fa2Verifier,
  SelfPublishedVerifier,
  MessageVerifier,
];

export type DecodedAssetId =
  | Erc721AssetId
  | Erc1155AssetId
  | Fa2AssetId
  | SelfPublishedAssetId
  | MessageAssetId;

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

  /** Parse and validated a decoded asset ID */
  parseAssetId(
    /** A decoded asset ID object to be validated and parsed into expected data formats */
    decodedAssetId: any,
    /** If true, allow missing values. */
    partial: false
  ): DecodedAssetId;

  /** Parse and validated a decoded asset ID, allowing missing fields. */
  parseAssetId(
    /** A decoded asset ID object to be validated and parsed into expected data formats */
    decodedAssetId: any,
    /** If true, allow missing values. */
    partial: true
  ): Partial<DecodedAssetId>;

  parseAssetId(
    /** A decoded asset ID object to be validated and parsed into expected data formats */
    decodedAssetId: any,
    /** If true, allow missing values. */
    partial: boolean
  ) {
    if (!decodedAssetId) {
      throw new Error("No assetId provided");
    }

    const verifier = this.getVerifier(decodedAssetId.assetType);

    if (!verifier) {
      throw new Error(`Unknown asset type: ${decodedAssetId?.assetType}`);
    }

    if (partial) {
      return verifier.parseAssetId(decodedAssetId, true);
    } else {
      return verifier.parseAssetId(decodedAssetId);
    }
  }

  decodeAssetId(encodedAssetId: EncodedAssetId): DecodedAssetId {
    const verifier = this.getVerifierFromEncoded(encodedAssetId);

    const decodedAssetId = verifier.decodeAssetId(
      encodedAssetId
    ) as DecodedAssetId;

    // Verify and throw error if bad
    return this.parseAssetId(decodedAssetId, false);
  }

  encodeAssetId(assetId: DecodedAssetId): EncodedAssetId {
    const verifier = this.getVerifier(assetId.assetType);
    const parsedAssetId = this.parseAssetId(assetId, false);
    return verifier.encodeAssetId(parsedAssetId);
  }

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  hashAssetId(decodedAssetId: DecodedAssetId): string {
    const verifier = this.getVerifier(decodedAssetId.assetType);
    const parsedAssetId = this.parseAssetId(decodedAssetId, false);
    return verifier.hashAssetId(parsedAssetId);
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
