import type { Signer } from "@ethersproject/abstract-signer";
import type { BigNumber } from "@ethersproject/bignumber";
import type {
  ContractTransaction,
  PayableOverrides,
} from "@ethersproject/contracts";
import type { Provider } from "@ethersproject/providers";
import { verifyMessage } from "@ethersproject/wallet";

import { GsrAddress } from "./addresses";
import {
  AssetTypeVerifier,
  DecodedAssetId,
} from "./asset-types/AssetTypeVerifier";
import { ensureActiveChain } from "./ensure-chain";
import { GeohashBits } from "./geohash";
import { GsrIndexer } from "./gsr-indexer";
import {
  getTransactionData,
  MetaTransaction,
  TypedSigner,
} from "./metaTransactions";
import {
  decodeGsrPlacementEvent,
  deserializeGsrPlacement,
  GsrPlacement,
  ValidatedGsrPlacement,
} from "./placement-event";
import { getChainProvider, ProviderKeys } from "./provider";
import {
  GeoSpatialRegistry,
  GsrPlacementEvent,
} from "./typechain/GeoSpatialRegistry";
import { GeoSpatialRegistry__factory } from "./typechain/factories/GeoSpatialRegistry__factory";

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

export interface ContractCallResponse {
  tx: ContractTransaction;
  sync: Promise<void>;
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

  /** If true, log the GSR's chainID when set up. */
  logging?: boolean;
}

/** Make requests to the GSR smart contract using decoded asset IDs. */
export class GsrContract {
  /** Reference to the contract. */
  public contract: GeoSpatialRegistry;
  /** RPC Provider for read access to the contract.  */
  public gsrProvider: Provider;
  /** Reference to the asset type verifiers. */
  public verifier: AssetTypeVerifier;
  /** ChainId contract calls will go to. */
  public chainId: number;
  /** Reference to the indexer for the same Chain ID */
  private indexer: GsrIndexer;

  constructor(
    providerKeys: ProviderKeys,
    {
      chainId = 137,
      customGsrProvider,
      customGsrAddress,
      indexer = new GsrIndexer(chainId),
      logging,
    }: GsrContractOpts = {}
  ) {
    this.chainId = chainId;

    this.gsrProvider =
      customGsrProvider || getChainProvider(this.chainId, providerKeys);

    if (indexer.chainId !== this.chainId) {
      // eslint-disable-next-line no-console
      console.warn("GsrIndexer and GsrContract have different chain IDs");
    }

    this.indexer = indexer;
    this.verifier = new AssetTypeVerifier(providerKeys);

    const address = customGsrAddress || GsrAddress[this.chainId];

    this.contract = GeoSpatialRegistry__factory.connect(
      address,
      this.gsrProvider
    );

    if (logging) {
      // eslint-disable-next-line no-console
      console.info("Initialized GSR Contract", {
        chainId,
        address,
      });
    }
  }

  /** Parse and validate a DecodedAssetID */
  parseAssetId(decodedAssetId: any, partial?: false): DecodedAssetId;
  /** Parse and validate a partial DecodedAssetID */
  parseAssetId(decodedAssetId: any, partial: true): Partial<DecodedAssetId>;
  parseAssetId(decodedAssetId: any, partial?: boolean) {
    if (partial) {
      return this.verifier.parseAssetId(decodedAssetId, true);
    } else {
      return this.verifier.parseAssetId(decodedAssetId, false);
    }
  }

  /** Fetch GSR events since the that block number processed. */
  async fetchEvents(lastBlockNumber: number) {
    const currentBlockNumber = await this.gsrProvider.getBlockNumber();

    // Don't try to fetch when the since block is the current block
    if (lastBlockNumber >= currentBlockNumber) {
      return { blockNumber: currentBlockNumber, events: [] };
    }

    const placementEvent = this.contract.filters.GsrPlacement();

    // If requesting historical data, start fetching that as well as starting the listener.
    const encodedEvents = await this.contract.queryFilter(
      placementEvent,
      lastBlockNumber ? lastBlockNumber + 1 : currentBlockNumber
    );

    const events = encodedEvents.reduce((decodedEvents, event) => {
      try {
        const decodedEvent = this.decodePlacementEvent(event);
        decodedEvents.push(decodedEvent);
        return decodedEvents;
      } catch (error) {
        // Don't emit events that can't be decoded.
        console.error("Error decoding event", error);
        return decodedEvents;
      }
    }, [] as GsrPlacement<DecodedAssetId>[]);

    return { blockNumber: currentBlockNumber, events };
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

  /** Relay a signed metaTransaction to the GSR Smart Contract */
  async executeMetaTransaction(
    signer: Signer,
    metaTransaction: MetaTransaction,
    /** Pass in overrides like Nonce */
    overrides?: PayableOverrides
  ): Promise<string> {
    const tx = await this.contract
      .connect(signer)
      .executeMetaTransaction(
        metaTransaction.address,
        metaTransaction.functionSignature,
        metaTransaction.r,
        metaTransaction.s,
        metaTransaction.v,
        overrides
      );

    return tx.hash;
  }

  /** Await a transaction, then do an Indexer sync. Useful for metaTransactions */
  async syncAfterTransactionHash(
    txHash: string
  ): Promise<ContractCallResponse> {
    const tx = await this.gsrProvider.getTransaction(txHash);
    const sync = this.syncAfterTx(tx);
    return { tx, sync };
  }

  /** Place an asset on the GSR with a transaction. */
  async place(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    geohash: GeohashBits,
    {
      timeRange = { start: 0, end: 0 },
      sceneUri,
      ensureChain = true,
    }: {
      /** Optionally add a start and/or end date that the placement is valid within. */
      timeRange?: TimeRange;
      /** Optionally pass a sceneUri to set with the placement. */
      sceneUri?: string;
      /** If false, do not verify the chain ID of the wallet. */
      ensureChain?: boolean;
    } = {}
  ): Promise<ContractCallResponse> {
    //
    if (ensureChain) {
      await ensureActiveChain(signer, this.chainId);
    }

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

  /** Place an asset on the GSR with a metaTransaction. */
  async placeWithMetaTransaction(
    signer: TypedSigner,
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

  /** Place an asset inside another asset in the GSR */
  async placeInside(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    decodedTargetAssetId: DecodedAssetId,
    timeRange = { start: 0, end: 0 }
  ): Promise<ContractCallResponse> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const hashedTargetAssetId = this.verifier.hashAssetId(decodedTargetAssetId);

    const tx = await this.contract
      .connect(signer)
      .placeInside(encodedAssetId, hashedTargetAssetId, timeRange);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Place an asset inside another asset in the GSR with a metaTransaction */
  async placeInsideWithMetaTransaction(
    signer: TypedSigner,
    decodedAssetId: DecodedAssetId,
    decodedTargetAssetId: DecodedAssetId,
    timeRange = { start: 0, end: 0 }
  ): Promise<MetaTransaction> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const hashedTargetAssetId = this.verifier.hashAssetId(decodedTargetAssetId);

    return getTransactionData(this.contract, signer, "placeInside", [
      encodedAssetId,
      hashedTargetAssetId,
      timeRange,
    ]);
  }

  /** Clear an asset's placement with a transaction */
  async removePlacement(
    signer: Signer,
    decodedAssetId: DecodedAssetId
  ): Promise<ContractCallResponse> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const tx = await this.contract
      .connect(signer)
      .removePlacement(encodedAssetId);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Clear an asset's placement with a metaTransaction */
  async removePlacementWithMetaTransaction(
    signer: TypedSigner,
    decodedAssetId: DecodedAssetId
  ): Promise<MetaTransaction> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    return getTransactionData(this.contract, signer, "removePlacement", [
      encodedAssetId,
    ]);
  }

  /** Update the scene metadata for a placement without moving the item with a transaction */
  async updateSceneUri(
    signer: Signer,
    decodedAssetId: DecodedAssetId,
    sceneUri: string
  ): Promise<ContractCallResponse> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    const tx = await this.contract
      .connect(signer)
      .updateSceneUri(encodedAssetId, sceneUri);

    const sync = this.syncAfterTx(tx);

    return { tx, sync };
  }

  /** Update the scene metadata for a placement without moving the item with a metaTransaction */
  async updateSceneUriWithMetaTransaction(
    signer: TypedSigner,
    decodedAssetId: DecodedAssetId,
    sceneUri: string
  ): Promise<MetaTransaction> {
    const encodedAssetId = this.verifier.encodeAssetId(decodedAssetId);

    return getTransactionData(this.contract, signer, "updateSceneUri", [
      encodedAssetId,
      sceneUri,
    ]);
  }

  /** Decode a Placement event into useful data. */
  decodePlacementEvent(event: GsrPlacementEvent): GsrPlacement {
    return decodeGsrPlacementEvent(event, this.verifier);
  }

  /** Get the hashed assetId for an asset. */
  getAssetId(decodedAssetId: DecodedAssetId): string {
    return this.verifier.hashAssetId(decodedAssetId);
  }

  /** Verify that a webhook request came from the indexer */
  verifyPlacementWebhookMessage(
    body: string,
    signature: string,
    expectedEndpoint: string
  ): ValidatedGsrPlacement[] {
    const { payload, endpoint } = JSON.parse(body);

    if (endpoint !== expectedEndpoint) {
      throw new Error("Endpoint mismatch");
    }

    const signer = verifyMessage(body, signature);

    if (signer.toLowerCase() !== this.indexer.address.toLowerCase()) {
      throw new Error("Invalid signature");
    }

    return payload.map(deserializeGsrPlacement);
  }

  async syncAfterTx(tx: ContractTransaction) {
    try {
      await tx.wait();
      await this.indexer.sync();
    } catch (e) {
      console.error(e);
    }
  }
}
