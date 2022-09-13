import type { ContractTransaction, Signer } from "ethers";
import { JsonRpcSigner, Provider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";

import { GsrAddress } from "./addresses";
import {
  GeoSpatialRegistry,
  GsrPlacementEvent,
} from "./typechain/GeoSpatialRegistry";
import { GeoSpatialRegistry__factory } from "./typechain/factories/GeoSpatialRegistry__factory";
import { getChainProvider, ProviderKeys } from "./provider";
import { GeohashBits } from "./geohash";
import {
  AssetTypeVerifier,
  DecodedAssetId,
} from "./asset-types/AssetTypeVerifier";
import {
  decodeGsrPlacementEvent,
  GsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";
import { GsrIndexer } from "./gsr-indexer";
import { getTransactionData, MetaTransaction } from "./metaTransactions";

/** Return value from placeOf */
export interface PlaceOf {
  geohash: BigNumber;
  bitPrecision: number;
  startTime: Date;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface GsrContractOpts {
  /**
   * Chain ID of the GSR smart contract
   * @default 137 (polygon)
   */
  chainId?: number;
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
   * If you have instantiated a GsrIndexer instance, pass it in here.
   * Otherwise a new instance will be created.
   */
  indexer?: GsrIndexer;
}

/** Make requests to the GSR smart contract using decoded asset IDs. */
export class GsrContract {
  public contract: GeoSpatialRegistry;
  public gsrProvider: Provider;

  private verifier: AssetTypeVerifier;
  private indexer: GsrIndexer;

  constructor(
    providerKeys: ProviderKeys,
    {
      chainId = 137,
      customGsrProvider,
      customGsrAddress,
      indexer = new GsrIndexer(chainId),
    }: GsrContractOpts = {}
  ) {
    this.gsrProvider =
      customGsrProvider || getChainProvider(chainId, providerKeys);

    if (indexer.chainId !== chainId) {
      // eslint-disable-next-line no-console
      console.warn("GsrIndexer and GsrContract have different chain IDs");
    }

    this.indexer = indexer;
    this.verifier = new AssetTypeVerifier(providerKeys);

    const address = customGsrAddress || GsrAddress[chainId];

    this.contract = GeoSpatialRegistry__factory.connect(
      address,
      this.gsrProvider
    );

    // eslint-disable-next-line no-console
    console.info("Initialized GSR Contract", {
      chainId,
      address,
    });
  }

  parseAssetId(decodedAssetId: any, partial?: false): DecodedAssetId;
  parseAssetId(decodedAssetId: any, partial: true): Partial<DecodedAssetId>;
  parseAssetId(decodedAssetId: any, partial?: boolean) {
    if (partial) {
      return this.verifier.parseAssetId(decodedAssetId, false);
    } else {
      return this.verifier.parseAssetId(decodedAssetId, true);
    }
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
  async verifyPlacement(
    placement: GsrPlacement
  ): Promise<ValidatedGsrPlacement> {
    return {
      ...placement,
      placedByOwner: await this.verifier
        .verifyAssetOwnership(placement)
        .catch(() => false),
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

  async placeWithMetaTransaction(
    signer: JsonRpcSigner,
    decodedAssetId: DecodedAssetId,
    geohash: GeohashBits,
    {
      timeRange = { start: 0, end: 0 },
      sceneUri,
    }: {
      timeRange?: TimeRange;
      sceneUri?: string;
      /** If true don't resolve the promise until the placement is minted and synced.  */
    } = {}
  ): Promise<MetaTransaction> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    return sceneUri
      ? getTransactionData(this.contract, signer, "placeWithScene", [
          encodedAssetId,
          geohash,
          timeRange,
          sceneUri,
        ])
      : getTransactionData(this.contract, signer, "place", [
          encodedAssetId,
          geohash,
          timeRange,
        ]);
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
      /** If true don't resolve the promise until the placement is minted and synced.  */
    } = {}
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const tx = sceneUri
      ? await this.contract
          .connect(signer)
          .placeWithScene(encodedAssetId, geohash, timeRange, sceneUri)
      : await this.contract
          .connect(signer)
          .place(encodedAssetId, geohash, timeRange);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
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

    const tx = await this.contract
      .connect(signer)
      .placeInside(encodedAssetId, hashedTargetAssetId, timeRange);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Clear an asset's placement */
  async removePlacement(signer: Signer, decodedAssetId: DecodedAssetId) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const tx = await this.contract
      .connect(signer)
      .removePlacement(encodedAssetId);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Update the scene metadata for a placement without moving the item */
  async updateSceneUri(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    sceneUri: string
  ) {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const tx = await this.contract
      .connect(signer)
      .updateSceneUri(encodedAssetId, sceneUri);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Decode a Placement event into useful data. */
  decodePlacementEvent(event: GsrPlacementEvent): GsrPlacement {
    return decodeGsrPlacementEvent(event, this.verifier);
  }

  private async syncAfterTx(tx: ContractTransaction) {
    try {
      await tx.wait();
      await this.indexer.sync();
    } catch (e) {
      console.error(e);
    }
  }
}
