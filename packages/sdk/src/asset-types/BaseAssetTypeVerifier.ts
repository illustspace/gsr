import { defaultAbiCoder } from "@ethersproject/abi";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { ObjectSchema } from "yup";
import { GsrPlacement } from "~/placement-event";
import type { DecodedAssetId } from "./AssetTypeVerifier";
import {
  AssetTypeVerifierMethods,
  EncodedAssetId,
} from "./AssetTypeVerifierMethods";

/**
 * Base class for asset type verifiers. Implement this to add a new asset type.
 */
export abstract class BaseAssetTypeVerifier<
  T extends DecodedAssetId = DecodedAssetId
> extends AssetTypeVerifierMethods {
  abstract assetType: string;
  private cachedEncodedAssetType?: string;
  abstract single: boolean;
  /** Yup schema for parsing incoming decoded asset IDs */
  abstract schema: ObjectSchema<T>;

  public get encodedAssetType(): string {
    this.cachedEncodedAssetType ||= keccak256(toUtf8Bytes(this.assetType));
    return this.cachedEncodedAssetType;
  }

  /** Parse and validated a decoded asset ID */
  parseAssetId(decodedAssetId: unknown, partial?: false): T;

  /** Parse and validated a decoded asset ID, allowing missing fields. */
  parseAssetId(decodedAssetId: unknown, partial: true): Partial<T>;

  parseAssetId(decodedAssetId: unknown, partial = false) {
    if (partial) {
      return this.schema
        .partial()
        .validateSync(decodedAssetId, { stripUnknown: true }) as Partial<T>;
    }

    return this.schema.validateSync(decodedAssetId, {
      stripUnknown: true,
    }) as T;
  }

  abstract decodeAssetId(assetId: EncodedAssetId): T;

  abstract encodeAssetId(assetId: T): EncodedAssetId;

  abstract verifyAssetOwnership(placement: GsrPlacement): Promise<boolean>;

  /** Hash a decoded AssetId to a simple AssetId used for GSR queries. */
  hashAssetId(assetId: T): string {
    const encodedAssetId = this.encodeAssetId(assetId);
    return this.hashEncodedAssetId(encodedAssetId);
  }

  /** Hash an EncodedAssetId to a simple AssetId used for GSR queries. */
  hashEncodedAssetId({
    assetType,
    collectionId,
    itemId,
  }: EncodedAssetId): string {
    return keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "bytes", "bytes"],
        [assetType, collectionId, itemId]
      )
    );
  }
}
