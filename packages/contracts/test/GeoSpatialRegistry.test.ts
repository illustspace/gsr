/* eslint-disable no-else-return */
/* eslint-disable no-unused-expressions */
import { Contract } from "ethers";
import { ethers, getChainId } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "@ethersproject/bignumber";
import { encode_int } from "ngeohash";
import { keccak256 } from "ethers/lib/utils";
import { Provider } from "@ethersproject/providers";

import {
  AssetId,
  GeoSpatialRegistry,
  GeoSpatialRegistry__factory,
  GsrPlacementEvent,
  GsrPlacement,
  Erc721AssetId,
  decodeGsrPlacementEvent,
  EncodedAssetId,
  Erc721Verifier,
} from "@gsr/sdk";

const tokenId = BigNumber.from(1);

const venice = { latitude: 33.98767333380228, longitude: -118.47232098946658 };

const locationBitPrecision = 6 * 5;
const location = encode_int(
  venice.latitude,
  venice.longitude,
  locationBitPrecision
);
/** a geohash param to pass to the contract */
const geohash = { geohash: location, bitPrecision: locationBitPrecision };

const boundingBitPrecision = 2 * 5;
const boundingLocation = encode_int(
  venice.latitude,
  venice.longitude,
  boundingBitPrecision
);
const boundingGeohash = {
  geohash: boundingLocation,
  bitPrecision: boundingBitPrecision,
};

/** An representation of an empty bytes32 */
const emptyBytes32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const sceneUri = "http://example.com/scene1";

describe("GeoSpatialRegistry", () => {
  let tokenContract: Contract;
  let gsr: GeoSpatialRegistry;
  let fullAssetId: AssetId;
  /** Hardhat chainId */
  let chainId: number;

  let admin: SignerWithAddress;
  let nftOwner: SignerWithAddress;
  let user: SignerWithAddress;
  let encodedAssetId: EncodedAssetId;
  let assetId: string;
  let timeRange: GeoSpatialRegistry.TimeRangeStruct;
  let verifier: Erc721Verifier;

  beforeEach(async () => {
    chainId = Number(await getChainId());

    verifier = new Erc721Verifier(
      {},
      {
        [chainId]: ethers.provider,
      }
    );

    [admin, nftOwner, user] = await ethers.getSigners();

    const gsrContractFactory = await ethers.getContractFactory(
      "GeoSpatialRegistry"
    );

    const testTokenFactory = await ethers.getContractFactory("TestToken");

    const deployedContract = await gsrContractFactory.deploy(
      "GeoSpatialRegistry"
    );

    // Get a typed GSR contract
    gsr = GeoSpatialRegistry__factory.connect(
      deployedContract.address,
      admin.provider as Provider
    );

    tokenContract = await testTokenFactory.deploy();

    fullAssetId = {
      assetType: "ERC721",
      chainId,
      contractAddress: tokenContract.address,
      tokenId: tokenId.toString(),
    };

    encodedAssetId = verifier.encodeAssetId(fullAssetId);

    assetId = verifier.hashAssetId(fullAssetId);

    timeRange = { start: 0, end: 0 };
  });

  /** used to make sure timestamps always increase */
  let timestampDelta = 0;
  /** Set and return the next block's timestamp in seconds. */
  const setNextBlockTimestamp = async () => {
    timestampDelta += 1;

    const timestampMs = Date.now();
    const timestamp = Math.ceil(timestampMs / 1000) + 1000 * timestampDelta;
    await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
    return timestamp;
  };

  /** Convert a GeohashStruct to one that can be compared in an event */
  const geohashToEventArray = (
    geohashStruct: GeoSpatialRegistry.GeohashStruct
  ): BigNumber[] => {
    return [
      BigNumber.from(geohashStruct.geohash),
      BigNumber.from(geohashStruct.bitPrecision),
    ];
  };

  /** Convert a GeohashStruct to one that can be compared in an event */
  const timeRangeToEventArray = (
    timeRangeStruct: GeoSpatialRegistry.TimeRangeStruct
  ): BigNumber[] => {
    return [
      BigNumber.from(timeRangeStruct.start),
      BigNumber.from(timeRangeStruct.end),
    ];
  };

  const encodedAssetIdToEventArray = ({
    assetType,
    collectionId,
    itemId,
  }: EncodedAssetId) => {
    return [assetType, collectionId, itemId];
  };

  /** Expect a GsrPlacement event */
  const expectEvent = async (
    tx: Promise<any>,
    timestamp: number,
    opts: any = {}
  ) => {
    const expectedEncodedAssetId: EncodedAssetId =
      opts.externalAssetId ?? encodedAssetId;

    return expect(tx)
      .to.emit(gsr, "GsrPlacement")
      .withArgs(
        // assetId
        opts.assetId ?? assetId,
        // parentAssetId
        opts.parentAssetId ?? emptyBytes32,
        // chainCollectionHash
        keccak256(expectedEncodedAssetId.collectionId),
        // fullAssetId
        encodedAssetIdToEventArray(expectedEncodedAssetId),
        // publisher
        opts.publisher ?? nftOwner.address,
        // published
        opts.published ?? true,
        // geohash
        geohashToEventArray(opts.geohash ?? geohash),
        // sceneUri,
        opts.sceneUri ?? "",
        // placedAt,
        timestamp,
        // timeRange,
        timeRangeToEventArray(opts.timeRange ?? timeRange)
      );
  };

  describe("ownership verification", () => {
    describe("given the token is not minted", () => {
      describe("when the token is placed", () => {
        it("emits an event that can be used to fail ownership", async () => {
          const tx = await gsr
            .connect(nftOwner)
            .place(
              encodedAssetId,
              { geohash: location, bitPrecision: locationBitPrecision },
              timeRange
            );

          // Get the relevant log.
          const receipt = await tx.wait();
          const logs = receipt.logs.map((log) => {
            return gsr.interface.parseLog(log);
          });
          const event = logs[0] as any as GsrPlacementEvent;
          const placement = decodeGsrPlacementEvent(
            event,
            verifier
          ) as GsrPlacement<Erc721AssetId>;

          expect(await verifier.verifyAssetOwnership(placement)).to.eq(false);
        });
      });
    });

    describe("given the token is minted", () => {
      beforeEach(async () => {
        await tokenContract.connect(admin).mint(nftOwner.address, tokenId);
      });

      describe("when the token is placed by the owner", () => {
        it("emits an event that can be used to check ownership", async () => {
          const tx = await gsr
            .connect(nftOwner)
            .place(
              encodedAssetId,
              { geohash: location, bitPrecision: locationBitPrecision },
              timeRange
            );

          // Get the relevant log.
          const receipt = await tx.wait();
          const logs = receipt.logs.map((log) => {
            return gsr.interface.parseLog(log);
          });
          const event = logs[0] as any as GsrPlacementEvent;
          const placement = decodeGsrPlacementEvent(
            event,
            verifier
          ) as GsrPlacement<Erc721AssetId>;

          expect(await verifier.verifyAssetOwnership(placement)).to.eq(true);
        });
      });

      describe("when the token is placed by a non-owner", () => {
        it.only("emits an event that can be used to fail ownership", async () => {
          const tx = await gsr
            // Not the owner
            .connect(user)
            .place(
              encodedAssetId,
              { geohash: location, bitPrecision: locationBitPrecision },
              timeRange
            );

          // Get the relevant log.
          const receipt = await tx.wait();
          const logs = receipt.logs.map((log) => {
            return gsr.interface.parseLog(log);
          });
          const event = logs[0] as any as GsrPlacementEvent;
          const placement = decodeGsrPlacementEvent(
            event,
            verifier
          ) as GsrPlacement<Erc721AssetId>;

          expect(await verifier.verifyAssetOwnership(placement)).to.eq(false);
        });
      });
    });
  });

  describe("given no placed NFT", () => {
    describe("place", () => {
      it("allows the owner to place", async () => {
        await gsr
          .connect(nftOwner)
          .place(
            encodedAssetId,
            { geohash: location, bitPrecision: locationBitPrecision },
            timeRange
          );

        const placement = await gsr.placeOf(assetId, nftOwner.address);

        expect(placement.geohash).to.eq(location);
      });

      it("emits an event", async () => {
        const timestamp = await setNextBlockTimestamp();
        await expectEvent(
          gsr.connect(nftOwner).place(encodedAssetId, geohash, timeRange),
          timestamp
        );
      });

      it("does not set a sceneURI", async () => {
        await gsr.connect(nftOwner).place(encodedAssetId, geohash, timeRange);

        expect(await gsr.sceneURI(assetId, nftOwner.address)).to.eq("");
      });

      it("can set a start date", async () => {
        let nextTimestamp = await setNextBlockTimestamp();

        const start = nextTimestamp + 10;

        // Place with a future timestamp
        await gsr.connect(nftOwner).place(encodedAssetId, geohash, {
          start,
          end: 0,
        });

        // Asset is not active
        await expect(gsr.placeOf(assetId, nftOwner.address)).to.be.revertedWith(
          "GSR: Asset not yet active"
        );

        // Increment time past the startTime
        nextTimestamp = await setNextBlockTimestamp();
        // Mine a block to update the timestamp
        await ethers.provider.send("evm_mine", []);

        // Asset is now active
        const placeOf = await gsr.placeOf(assetId, nftOwner.address);
        expect(placeOf.geohash).to.eq(location);
        // placeOf should return the start time, which is later than the placedAt time
        expect(placeOf.startTime).to.eq(start);
      });

      it("can set an end date", async () => {
        let nextTimestamp = await setNextBlockTimestamp();

        // Place with a future timestamp
        await gsr.connect(nftOwner).place(encodedAssetId, geohash, {
          start: 0,
          // end time is slightly in the future
          end: nextTimestamp + 10,
        });

        // Asset is active
        expect((await gsr.placeOf(assetId, nftOwner.address)).geohash).to.eq(
          location
        );

        // Increment time past the endTime
        nextTimestamp = await setNextBlockTimestamp();
        // Mine a block to update the timestamp
        await ethers.provider.send("evm_mine", []);

        // Asset is no longer active
        await expect(gsr.placeOf(assetId, nftOwner.address)).to.be.revertedWith(
          "GSR: Asset expired"
        );
      });
    });

    describe("placeWithScene", () => {
      it("allows the owner to place and set a sceneUri in one transaction", async () => {
        await gsr
          .connect(nftOwner)
          .placeWithScene(encodedAssetId, geohash, timeRange, sceneUri);

        // Placement still works
        const placement = await gsr.placeOf(assetId, nftOwner.address);
        expect(placement.geohash).to.eq(location);

        // Also sets the scene uri
        expect(await gsr.sceneURI(assetId, nftOwner.address)).to.eq(sceneUri);
      });

      it("emits an event", async () => {
        const timestamp = await setNextBlockTimestamp();
        await expectEvent(
          gsr
            .connect(nftOwner)
            .placeWithScene(encodedAssetId, geohash, timeRange, sceneUri),
          timestamp,
          {
            sceneUri,
          }
        );
      });
    });

    describe("updateSceneUri", () => {
      it("reverts when the asset is not placed", async () => {
        await expect(
          gsr.connect(nftOwner).updateSceneUri(encodedAssetId, sceneUri)
        ).to.be.revertedWith("GSR: Asset not published");
      });
    });

    describe("placeOf", () => {
      it("reverts for an NFT not placed", async () => {
        await expect(gsr.placeOf(assetId, nftOwner.address)).to.be.revertedWith(
          "GSR: Asset not published"
        );
      });
    });

    describe("isWithin", () => {
      it("reverts for an NFT not placed", async () => {
        await expect(
          gsr.isWithin(
            // Use a geohash that is a prefix of the location
            boundingGeohash,
            assetId,
            nftOwner.address
          )
        ).to.be.revertedWith("GSR: Asset not published");
      });
    });
  });

  describe("given a placed NFT", () => {
    let timestamp: number;

    beforeEach(async () => {
      timestamp = await setNextBlockTimestamp();

      // Place an NFT
      // Set a scene
      await gsr
        .connect(nftOwner)
        .placeWithScene(encodedAssetId, geohash, timeRange, sceneUri);
    });

    describe("place", () => {
      it("allows the owner to remove a placement", async () => {
        await gsr.connect(nftOwner).removePlacement(encodedAssetId);

        await expect(gsr.placeOf(assetId, nftOwner.address)).to.be.revertedWith(
          ""
        );
      });

      it("allows the owner to update a placement", async () => {
        // Place an NFT
        await gsr
          .connect(nftOwner)
          .place(
            encodedAssetId,
            { ...geohash, geohash: location + 1 },
            timeRange
          );

        // Query for other's placement
        const placement = await gsr.placeOf(assetId, nftOwner.address);

        // Get owner's placement
        expect(placement.geohash).to.eq(location + 1);
      });

      it("allows others to place without changing the owner's placement", async () => {
        // Another user sets a place
        await gsr
          .connect(user)
          .place(
            encodedAssetId,
            { ...geohash, geohash: location + 1 },
            timeRange
          );

        // Query for owner's placement
        const placement = await gsr.placeOf(assetId, nftOwner.address);

        // Get owner's placement
        expect(placement.geohash).to.eq(location);

        // Query for other's placement
        const otherPlacement = await gsr.placeOf(assetId, user.address);

        // Get owner's placement
        expect(otherPlacement.geohash).to.eq(location + 1);
      });

      it("does not override a sceneURI", async () => {
        // Do a new placement
        await gsr
          .connect(nftOwner)
          .place(
            encodedAssetId,
            { ...geohash, geohash: location + 1 },
            timeRange
          );

        // Scene is unchanged.
        expect(await gsr.sceneURI(assetId, nftOwner.address)).to.eq(sceneUri);
      });
    });

    describe("placeWithScene", () => {
      it("overrides the placement and sceneUri", async () => {
        await gsr
          .connect(nftOwner)
          .placeWithScene(
            encodedAssetId,
            { ...geohash, geohash: location + 1 },
            timeRange,
            "http://example.com/new-scene"
          );

        // Also sets the scene uri
        expect(await gsr.sceneURI(assetId, nftOwner.address)).to.eq(
          "http://example.com/new-scene"
        );
      });
    });

    describe("updateSceneUri", () => {
      it("updates the sceneUri", async () => {
        await gsr
          .connect(nftOwner)
          .updateSceneUri(encodedAssetId, "http://example.com/new-scene");

        expect(await gsr.sceneURI(assetId, nftOwner.address)).to.eq(
          "http://example.com/new-scene"
        );
      });

      it("emits an event", async () => {
        await expectEvent(
          gsr
            .connect(nftOwner)
            .updateSceneUri(encodedAssetId, "http://example.com/new-scene"),
          timestamp,
          {
            sceneUri: "http://example.com/new-scene",
          }
        );
      });
    });

    describe("isWithin", () => {
      it("returns true for a location inside a box", async () => {
        const result = await gsr.isWithin(
          // Use a geohash that is a prefix of the location
          boundingGeohash,
          assetId,
          nftOwner.address
        );
        expect(result).to.be.true;
      });

      it("returns false for a location outside a box", async () => {
        const result = await gsr.isWithin(
          // Use a geohash that is not a prefix of the location
          {
            ...boundingGeohash,
            geohash: boundingLocation - 1,
          },
          assetId,
          nftOwner.address
        );
        expect(result).to.be.false;
      });

      it("returns false for a location larger than the box", async () => {
        const result = await gsr.isWithin(
          // Use a geohash that is the location, but more precise.
          {
            ...boundingGeohash,
            bitPrecision: locationBitPrecision + 5,
          },
          assetId,
          nftOwner.address
        );
        expect(result).to.be.false;
      });

      it("throws for an invalid bit precision that doesn't match", async () => {
        await expect(
          gsr.isWithin(
            // Use a geohash that is a prefix of the location
            {
              ...boundingGeohash,
              bitPrecision: 5,
            },
            assetId,
            nftOwner.address
          )
        ).to.be.revertedWith("GSR: Precision doesn't match");
      });

      it("throws for a bit precision that can't be encoded to a geohash", async () => {
        await expect(
          gsr.isWithin(
            // Use a geohash that is not a multiple of 5 bits
            {
              // eslint-disable-next-line no-bitwise
              geohash: boundingLocation >> 2,
              bitPrecision: boundingBitPrecision + 2,
            },
            assetId,
            nftOwner.address
          )
        ).to.be.revertedWith("GSR: Precision not multiple of 5");
      });
    });

    describe("placeInside", () => {
      /** AssetId for another asset placed inside assetId */
      const secondaryTokenId = tokenId.add(1);
      let decodedSecondaryAssetId: AssetId;
      let encodedSecondaryAssetId: EncodedAssetId;
      let secondaryAssetId: string;

      beforeEach(() => {
        decodedSecondaryAssetId = {
          assetType: "ERC721",
          chainId,
          contractAddress: tokenContract.address,
          tokenId: secondaryTokenId.toString(),
        };

        encodedSecondaryAssetId = verifier.encodeAssetId(
          decodedSecondaryAssetId
        );

        secondaryAssetId = verifier.hashAssetId(decodedSecondaryAssetId);
      });

      it("places an asset inside another one", async () => {
        await gsr
          .connect(nftOwner)
          .placeInside(encodedSecondaryAssetId, assetId, timeRange);

        // Get the location of the secondary asset
        const placement = await gsr.placeOf(secondaryAssetId, nftOwner.address);

        // Returns the location of the parent asset
        expect(placement.geohash).to.eq(location);

        // The child is inside the parent
        expect(
          await gsr.isInsideAsset(secondaryAssetId, assetId, nftOwner.address)
        ).to.be.true;
      });

      it("emits an event", async () => {
        const nextTimestamp = await setNextBlockTimestamp();
        await expectEvent(
          gsr
            .connect(nftOwner)
            .placeInside(encodedSecondaryAssetId, assetId, timeRange),
          nextTimestamp,
          {
            assetId: secondaryAssetId,
            parentAssetId: assetId,
            externalAssetId: encodedSecondaryAssetId,
            geohash: {
              geohash: 0,
              bitPrecision: 0,
            },
          }
        );
      });
    });
  });

  describe("pausing", () => {
    it("cannot place when paused", async () => {
      await gsr.connect(admin).pause();

      await expect(
        gsr.connect(nftOwner).place(encodedAssetId, geohash, timeRange)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("can place after un-pausing", async () => {
      await gsr.connect(admin).pause();
      await gsr.connect(admin).unpause();

      await expect(
        gsr.connect(nftOwner).place(encodedAssetId, geohash, timeRange)
      ).not.to.be.reverted;
    });
  });
});
