/// @title Geo Spatial Registry
/// @author Illust Space

// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./meta-transactions/ContentMixin.sol";
import "./meta-transactions/NativeMetaTransaction.sol";

/// @title GeoSpatialRegistry
/// @author Illust
/// @notice A hyperstructure for registering the location and display data for a digital asset
contract GeoSpatialRegistry is NativeMetaTransaction, ContextMixin {
    /// A geohash, encoded as a number and a precision.
    /// @dev this is an integer representation of a standard geohash.
    /// @param geohash - the geohash as an integer
    /// @param bitPrecision - the precision of the geohash.
    struct Geohash {
        uint64 geohash;
        uint8 bitPrecision;
    }

    /// The values that are hashed to construct an assetId.
    /// @dev these are passed to the GsrPlacement event for search and verification.
    /// @param assetType - keccak256 hash of the asset type.
    /// @param collectionId - encoded values that represent the collection. Could be chainId/contractAddress. this is broken out to allow for bloom filters on a collection.
    /// @param itemId - encoded values that represent the item. Could be tokenId.
    struct EncodedAssetId {
        bytes32 assetType;
        bytes collectionId;
        bytes itemId;
    }

    /// Describes the timestamps during which the placement is valid.
    /// @param start - The placement should only be considered active after this date.
    /// @param end - The placement not be considered active after this date. 0 for no end date.
    struct TimeRange {
        uint256 start;
        uint256 end;
    }

    /// Record the current location of an NFT.
    /// @param linkedPublisher - an account on another service that the publisher also controls, which owns the asset.
    /// @param published - True if this publisher has published a placement for this piece.
    /// @param geohash - Geohash of the placement location.
    /// @param parentAssetId - Another asset this asset is placed inside of. If set, should override geohash.
    /// @param sceneUri - Optional URI describing the scene to show at the NFT's location.
    /// @param placedAt - When the asset was placed. Used for use cases like "staking" an asset at a location.
    /// @param timeRange - When the asset is valid.
    struct Placement {
        bytes linkedPublisher;
        bool published;
        Geohash geohash;
        bytes32 parentAssetId;
        string sceneUri;
        uint256 placedAt;
        TimeRange timeRange;
    }

    /// Contract name
    string public name;

    /// Stores asset placements for each publisher.
    /// @dev Holds a mapping of publisherAddress => assetId => placement.
    mapping(address => mapping(bytes32 => Placement)) public placements;

    /// Describes a placement event.
    /// @param assetId - the keccak256 hash of the encodedAssetId, used as the internal id.
    /// @param parentAssetId - Another asset this asset is placed inside of. If set, should override geohash.
    /// @param collectionIdHash - keccak256 hash of type of encodedAssetId.collectionId for search.
    /// @param fullAssetId - Full assetId data for checking ownership.
    /// @param publisher - Address that published this placement.
    /// @param published - If false, this change removes the existing placement.
    /// @param geohash - Geohash of the placement location.
    /// @param sceneUri - Optional URI describing the scene to show at the NFT's location.
    /// @param placedAt - When the asset was placed.
    /// @param timeRange - The placement should only be considered active during this time range.
    event GsrPlacement(
        // ===============
        // Indexed fields
        // ===============
        bytes32 indexed assetId,
        bytes32 indexed parentAssetId,
        bytes32 indexed collectionIdHash,
        // ===============
        // AssetId Details
        // ===============
        EncodedAssetId fullAssetId,
        // ===============
        // Placement data
        // ===============
        address publisher,
        bool published,
        Geohash geohash,
        string sceneUri,
        uint256 placedAt,
        TimeRange timeRange
    );

    /// Constructor
    /// @param initialName the name of the contract
    constructor(string memory initialName) {
        name = initialName;
        _initializeEIP712(initialName);
    }

    /// Place a piece according to a publisher.
    /// @param encodedAssetId the external encoded asset id of the piece to place.
    /// @param geohash the geohash of the location to place the piece.
    /// @param timeRange the time range during which the placement is valid.
    function place(
        EncodedAssetId calldata encodedAssetId,
        Geohash calldata geohash,
        TimeRange calldata timeRange
    ) external {
        _verifyGeohash(geohash);

        bytes32 assetId = _assetId(encodedAssetId);

        /// @dev Look up the placement
        Placement storage placement = placements[_msgSender()][assetId];

        /// @dev Store the placement
        placement.published = true;
        placement.geohash = geohash;
        placement.parentAssetId = "";
        placement.placedAt = block.timestamp;
        placement.timeRange = timeRange;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// Place a piece according to a publisher, and set the scene URI, in one transaction.
    /// @param encodedAssetId the external encoded asset id of the piece to place.
    /// @param geohash the geohash of the location to place the piece.
    /// @param timeRange the time range during which the placement is valid.
    /// @param sceneUri the URI of the scene to show at the location.
    function placeWithScene(
        EncodedAssetId calldata encodedAssetId,
        Geohash calldata geohash,
        TimeRange calldata timeRange,
        string calldata sceneUri
    ) external {
        _verifyGeohash(geohash);

        bytes32 assetId = _assetId(encodedAssetId);

        /// @dev Look up the placement
        Placement storage placement = placements[_msgSender()][assetId];

        /// @dev Store the placement
        placement.published = true;
        placement.geohash = geohash;
        placement.parentAssetId = "";
        placement.placedAt = block.timestamp;
        placement.timeRange = timeRange;
        placement.sceneUri = sceneUri;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// Place an asset inside another asset, making it available for use in scenes.
    /// @param encodedAssetId the external encoded asset id of the piece to place.
    /// @param parentAssetId the external asset id of the piece to place inside of.
    /// @param timeRange the time range during which the placement is valid.
    function placeInside(
        EncodedAssetId calldata encodedAssetId,
        bytes32 parentAssetId,
        TimeRange calldata timeRange
    ) external {
        /// @dev Find the parent's placement.
        Placement storage parentPlacement = _findValidPlacement(
            parentAssetId,
            _msgSender(),
            false
        );

        /// @dev Make sure the parent is not already inside another asset.
        require(parentPlacement.parentAssetId == "", "GSR: Parent is a child");

        bytes32 assetId = _assetId(encodedAssetId);

        /// @dev Then get the child's placement.
        Placement storage placement = placements[_msgSender()][assetId];

        /// @dev And set it to point at the parent, clearing the geohash.
        placement.published = true;
        placement.geohash = Geohash(0, 0);
        placement.parentAssetId = parentAssetId;
        placement.placedAt = block.timestamp;
        placement.timeRange = timeRange;
        placement.sceneUri = "";

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// Remove an asset from the GSR.
    /// @param encodedAssetId the external encoded asset id of the piece remove.
    function removePlacement(EncodedAssetId calldata encodedAssetId) external {
        bytes32 assetId = _assetId(encodedAssetId);

        Placement storage placement = placements[_msgSender()][assetId];
        placement.published = false;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// Just update a sceneUri without changing the placement. This will not effect the placedAt time.
    /// @param encodedAssetId the external encoded asset id of the piece to place.
    /// @param sceneUri the URI of the scene to show at the location.
    function updateSceneUri(
        EncodedAssetId calldata encodedAssetId,
        string memory sceneUri
    ) external {
        bytes32 assetId = _assetId(encodedAssetId);

        Placement storage placement = _findValidPlacement(
            assetId,
            _msgSender(),
            false
        );
        placement.sceneUri = sceneUri;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// Get the current location of an asset.
    /// @param assetId the external asset id of the piece to get the location of the piece.
    /// @param publisher the address of the publisher of the piece.
    /// @return geohash - the location of the placement.
    /// @return bitPrecision - the precision of the geohash.
    /// @return startTime - the time this placement has been active since..
    function placeOf(
        bytes32 assetId,
        address publisher
    )
        external
        view
        returns (uint64 geohash, uint8 bitPrecision, uint256 startTime)
    {
        Placement storage placement = _findValidPlacement(
            assetId,
            publisher,
            true
        );

        return (
            // return the geohash
            placement.geohash.geohash,
            placement.geohash.bitPrecision,
            // return either the placedAt or the startTime, whichever is later.
            _max(placement.timeRange.start, placement.placedAt)
        );
    }

    /// Get the Scene URI metadata of a published asset.
    /// @param assetId the external asset id of the piece to get the scene URI of.
    /// @param publisher the address of the publisher of the piece.
    /// @return the URI of the scene to show at the location.
    function sceneURI(
        bytes32 assetId,
        address publisher
    ) external view returns (string memory) {
        Placement storage placement = _findValidPlacement(
            assetId,
            publisher,
            true
        );

        return placement.sceneUri;
    }

    /// Check if an asset is within a bounding box using a geohash prefix.
    /// @param boundingGeohash the geohash of the bounding box.
    /// @param assetId the external asset id of the piece to check.
    /// @param publisher the address of the publisher of the piece.
    /// @return true if the asset is within the bounding box.
    function isWithin(
        Geohash calldata boundingGeohash,
        bytes32 assetId,
        address publisher
    ) external view returns (bool) {
        /// @dev Find the placement and revert if it's not active.
        Placement storage placement = _findValidPlacement(
            assetId,
            publisher,
            true
        );

        _verifyGeohash(boundingGeohash);

        /// @dev If the bounding box is smaller than the geohash, then it can't contain it.
        if (boundingGeohash.bitPrecision > placement.geohash.bitPrecision) {
            return false;
        }

        return
            boundingGeohash.geohash ==
            (placement.geohash.geohash >>
                (placement.geohash.bitPrecision -
                    boundingGeohash.bitPrecision));
    }

    /// Check if an asset is currently placed within another asset.
    /// @param assetId the external asset id of the piece to check.
    /// @param parentAssetId the external asset id of the piece to check against.
    /// @param publisher the address of the publisher of the piece.
    /// @return true if the asset is placed within the parent asset.
    function isInsideAsset(
        bytes32 assetId,
        bytes32 parentAssetId,
        address publisher
    ) external view returns (bool) {
        // Find the asset's placement, and don't recur down to the parent placement.
        Placement storage placement = _findValidPlacement(
            assetId,
            publisher,
            false
        );

        return placement.parentAssetId == parentAssetId;
    }

    /// Emit a placement event for an off-chain indexer to read.
    /// @param assetId the external asset id of the piece to emit the placement of.
    /// @param encodedAssetId the encoded asset id of the piece to emit the placement of.
    /// @param publisher the address of the publisher of the piece.
    /// @param placement the placement to emit.
    function _logPlacement(
        bytes32 assetId,
        EncodedAssetId calldata encodedAssetId,
        address publisher,
        Placement storage placement
    ) internal {
        emit GsrPlacement(
            /// @dev Indexed
            assetId,
            placement.parentAssetId,
            keccak256(encodedAssetId.collectionId),
            /// @dev Asset ID
            encodedAssetId,
            /// @dev Placement
            publisher,
            placement.published,
            placement.geohash,
            placement.sceneUri,
            placement.placedAt,
            placement.timeRange
        );
    }

    /// Look up a placement, and verify that it is valid.
    /// @param assetId the external asset id of the piece to find the placement of.
    /// @param publisher the address of the publisher of the piece.
    /// @param followInside if true, recurse down to the parent placement.
    function _findValidPlacement(
        bytes32 assetId,
        address publisher,
        bool followInside
    ) internal view returns (Placement storage) {
        /// @dev Get the placement by address and assetId.
        Placement storage placement = placements[publisher][assetId];

        /// @dev Verify that the placement is published.
        require(placement.published, "GSR: Asset not published");
        require(
            placement.timeRange.start <= block.timestamp,
            "GSR: Asset not yet active"
        );
        require(
            placement.timeRange.end == 0 ||
                placement.timeRange.end >= block.timestamp,
            "GSR: Asset expired"
        );

        /// @dev Follow placements one level down if requested.
        if (placement.parentAssetId > 0 && followInside) {
            placement = _findValidPlacement(
                placement.parentAssetId,
                publisher,
                false
            );

            /// @dev Don't allow nested placements, it could cause expensive loops.
            require(placement.parentAssetId == 0, "GSR: Parent is a child");
        }

        return placement;
    }

    /// This is used instead of msg.sender to account for metaTransactions.
    function _msgSender() internal view returns (address sender) {
        return ContextMixin.msgSender();
    }

    /// Calculate an asset ID from an encodedAssetId
    /// @param encodedAssetId the encoded asset id of the piece to calculate the asset id of
    function _assetId(
        EncodedAssetId calldata encodedAssetId
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    encodedAssetId.assetType,
                    encodedAssetId.collectionId,
                    encodedAssetId.itemId
                )
            );
    }

    /// Verify that a geohash and precision match.
    /// @param geohash the geohash to verify
    function _verifyGeohash(Geohash calldata geohash) internal pure {
        require(
            geohash.geohash >> geohash.bitPrecision == 0,
            "GSR: Precision doesn't match"
        );

        /// @dev Make sure the stored geohash can be rendered as a string.
        require(
            geohash.bitPrecision % 5 == 0,
            "GSR: Precision not multiple of 5"
        );
    }

    /// Return the highest of two integers.
    function _max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
