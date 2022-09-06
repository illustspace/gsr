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
import {
  decodeGsrPlacementEvent,
  GsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";

export interface GsrContractOpts {
  /**
   * Chain ID of the GSR smart contract
   * @default 137 (polygon)
   */
  chainId?: GsrChainId;
  /**
   * Pass in a custom provider for the GSR smart contract for custom chain IDs
   * If not passed in, the Alchemy provider will be used.
   */
  customGsrProvider?: Provider;
  /**
   * Custom address for the GSR smart contract.
   * Otherwise will pick a deployed contract based on the chain ID.
   */
  customGsrAddress?: string;
  /**
   * URL of the indexer API
   * Defaults to the production API server
   */
  indexerUrl?: string;
}

/** Make requests to the GSR smart contract using decoded asset IDs. */
export class GsrContract {
  public contract: GeoSpatialRegistry;
  public gsrProvider: Provider;

  private verifier: AssetTypeVerifier;
  private indexerUrl: string;

  constructor(
    providerKeys: ProviderKeys,
    {
      chainId = 137,
      indexerUrl = "https://gsr.illust.space",
      customGsrProvider,
      customGsrAddress,
    }: GsrContractOpts = {}
  ) {
    this.gsrProvider =
      customGsrProvider || getChainProvider(chainId, providerKeys);

    this.indexerUrl = indexerUrl;
    this.verifier = new AssetTypeVerifier(providerKeys);

    this.contract = GeoSpatialRegistry__factory.connect(
      customGsrAddress || GsrAddress[chainId],
      this.gsrProvider
    );
  }

  /** Fetch GSR events since a specified block number. */
  async fetchEvents(sinceBlockNumber: number) {
    const blockNumber = await this.gsrProvider.getBlockNumber();

    const placementEvent = this.contract.filters.GsrPlacement();

    // If requesting historical data, start fetching that as well as starting the listener.
    const encodedEvents = await this.contract.queryFilter(
      placementEvent,
      sinceBlockNumber || blockNumber
    );

    const events = encodedEvents.map((event) => {
      return this.decodePlacementEvent(event);
    });

    return { blockNumber, events };
  }

  /** Verify if a placement was done by the owner.  */
  async verifyPlacement(placement: GsrPlacement): Promise<ValidatedGsrPlacement> {
    return {
      ...placement,
      placedByOwner: await this.verifier.verifyAssetOwnership(placement),
    };
  }

  /** Direct GSR query of the location of an asset by a specific address. */
  async placeOf(
    decodedAssetId: DecodedAssetId,
    publisher: string
  ): Promise<PlaceOf | null> {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    const result = await this.contract.placeOf(assetId, publisher);

    return {
      geohash: result.geohash,
      bitPrecision: result.bitPrecision,
      startTime: new Date(result.startTime.toNumber() * 1000),
    };
  }

  /** Get the scene metadata for a placement */
  async sceneURI(
    decodedAssetId: DecodedAssetId,
    publisher: string
  ): Promise<string | null> {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    return this.contract.sceneURI(assetId, publisher);
  }

  /** Check if a placement is within a geohash bounding box */
  async isWithin(
    boundingGeohash: GeohashBits,
    decodedAssetId: DecodedAssetId,
    publisher: string
  ) {
    const assetId = this.verifier.hashAssetId(decodedAssetId);
    return this.contract.isWithin(boundingGeohash, assetId, publisher);
  }

  /** Place an asset on the GSR with a transaction. */
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

  /** Place an asset inside another asset in the GSR */
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

  /** Clear an asset's placement */
  async removePlacement(signer: Signer, decodedAssetId: DecodedAssetId) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    this.contract.connect(signer).removePlacement(encodedAssetId);
  }

  /** Update the scene metadata for a placement without moving the item */
  async updateSceneUri(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    sceneUri: string
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    this.contract.connect(signer).updateSceneUri(encodedAssetId, sceneUri);
  }

  /** Decode a Placement event into useful data. */
  decodePlacementEvent(event: GsrPlacementEvent): GsrPlacement {
    return decodeGsrPlacementEvent(event, this.verifier);
  }
}
