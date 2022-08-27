import type { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import { GsrAddress, GsrChainId } from "./addresses";
import {
  GeoSpatialRegistry,
  GsrPlacementEvent,
} from "./typechain/GeoSpatialRegistry";
import { GeoSpatialRegistry__factory } from "./typechain/factories/GeoSpatialRegistry__factory";
import { getChainProvider, ProviderKeys } from "./provider";
import { TimeRange } from "./time-range";
import { GeohashBits } from "./geohash";
import { PlaceOf } from "./place";
import {
  AssetTypeVerifier,
  DecodedAssetId,
} from "./asset-types/AssetTypeVerifier";
import { TypedListener } from "./typechain/common";
import { decodeGsrPlacementEvent, GsrPlacement } from "./placement-event";

export interface GsrContractOpts {
  chainId?: GsrChainId;
  customGsrProvider?: Provider;
  customGsrAddress?: string;
}

export class GsrContract {
  public contract: GeoSpatialRegistry;
  private verifier: AssetTypeVerifier;

  constructor(
    providerKeys: ProviderKeys,
    { chainId = 137, customGsrProvider, customGsrAddress }: GsrContractOpts = {}
  ) {
    const gsrProvider =
      customGsrProvider || getChainProvider(chainId, providerKeys);

    this.verifier = new AssetTypeVerifier(providerKeys);

    this.contract = GeoSpatialRegistry__factory.connect(
      customGsrAddress || GsrAddress[chainId],
      gsrProvider
    );
  }

  /** Watch for GSR events */
  watchEvents(onEvent: (event: GsrPlacement) => void): () => void {
    const listener: TypedListener<GsrPlacementEvent> = (...args) => {
      const event = args[args.length - 1] as GsrPlacementEvent;
      const placement = decodeGsrPlacementEvent(event, this.verifier);

      onEvent(placement);
    };

    const placementEvent = this.contract.filters.GsrPlacement();

    // TODO
    this.contract.on(placementEvent, listener);

    return () => {
      this.contract.off(placementEvent, listener);
    };
  }

  verifyPlacement(placement: GsrPlacement): Promise<boolean> {
    return this.verifier.verifyAssetOwnership(
      placement.decodedAssetId,
      placement.publisher
    );
  }

  async placeOf(
    decodedAssetId: DecodedAssetId,
    publisher: string
  ): Promise<PlaceOf | null> {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    return this.contract.placeOf(assetId, publisher);
  }

  async sceneURI(
    decodedAssetId: DecodedAssetId,
    publisher: string
  ): Promise<string | null> {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    return this.contract.sceneURI(assetId, publisher);
  }

  async isWithin(
    boundingGeohash: GeohashBits,
    decodedAssetId: DecodedAssetId,
    publisher: string
  ) {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    return this.contract.isWithin(boundingGeohash, assetId, publisher);
  }

  async place(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    geohash: GeohashBits,
    {
      timeRange = { start: 0, end: 0 },
      sceneUri,
    }: {
      timeRange?: TimeRange;
      sceneUri?: string;
    } = {}
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    if (sceneUri) {
      return this.contract
        .connect(signer)
        .placeWithScene(encodedAssetId, geohash, timeRange, sceneUri);
    } else {
      return this.contract
        .connect(signer)
        .place(encodedAssetId, geohash, timeRange);
    }
  }

  async placeInside(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    decodedTargetAssetId: DecodedAssetId,
    timeRange = { start: 0, end: 0 }
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const hashedTargetAssetId = this.verifier.hashAssetId(decodedTargetAssetId);

    this.contract
      .connect(signer)
      .placeInside(encodedAssetId, hashedTargetAssetId, timeRange);
  }

  async removePlacement(signer: Signer, decodedAssetId: DecodedAssetId) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    this.contract.connect(signer).removePlacement(encodedAssetId);
  }

  async updateSceneUri(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    sceneUri: string
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    this.contract.connect(signer).updateSceneUri(encodedAssetId, sceneUri);
  }
}
