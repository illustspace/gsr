/// @title Geo Spatial Registry
/// @author Illust Space

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "hardhat/console.sol";

import "./meta-transactions/ContentMixin.sol";
import "./meta-transactions/NativeMetaTransaction.sol";

contract GeoSpatialRegistry is
    Ownable,
    AccessControl,
    Pausable,
    NativeMetaTransaction,
    ContextMixin
{
    /** Describes a placement event. */
    event GsrPlacement(
        // ===============
        // Indexed fields
        // ===============
        /// @dev the keccak256 hash of the encodedAssetId, used as the internal id.
        bytes32 indexed assetId,
        /// @dev Another asset this asset is placed inside of. If set, should override geohash.
        bytes32 indexed parentAssetId,
        /// @dev keccak256 hash of type of encodedAssetId.collectionId for search.
        bytes32 indexed collectionIdHash,
        // ===============
        // AssetId Details
        // ===============
        /// @dev Full assetId data for checking ownership.
        EncodedAssetId fullAssetId,
        // ===============
        // Placement data
        // ===============
        /// @dev Address that published this placement.
        address publisher,
        /// @dev If false, this change removes the existing placement.
        bool published,
        /// @dev Geohash of the placement location.
        Geohash geohash,
        /// @dev Optional URI describing the scene to show at the NFT's location.
        string sceneUri,
        /// @dev When the asset was placed.
        uint256 placedAt,
        /// @dev The placement should only be considered active during this time range.
        TimeRange timeRange
    );

    /** A geohash, encoded as a number and a precision. */
    struct Geohash {
        uint64 geohash;
        uint8 bitPrecision;
    }

    /** The values that are hashed to construct an assetId. */
    struct EncodedAssetId {
        /// @dev keccak256 hash of the asset type.
        bytes32 assetType;
        /// @dev encoded values that represent the collection. Could be chainId/contractAddress.
        bytes collectionId;
        /// @dev encoded values that represent the item. Could be tokenId.
        bytes itemId;
    }

    /** Describes the timestamps during which the placement is valid. */
    struct TimeRange {
        /// @dev The placement should only be considered active after this date.
        uint256 start;
        /// @dev The placement not be considered active after this date. 0 for no end date.
        uint256 end;
    }

    /** Record the current location of an NFT. */
    struct Placement {
        /// @dev True if this publisher has published a placement for this piece
        bool published;
        /// @dev Geohash of the placement location
        Geohash geohash;
        /// @dev Another asset this asset is placed inside of. If set, should override geohash.
        bytes32 parentAssetId;
        /// @dev Optional URI describing the scene to show at the NFT's location.
        string sceneUri;
        /// @dev When the asset was placed
        uint256 placedAt;
        TimeRange timeRange;
    }

    /** Contract name */
    string public name;

    /** Holds a mapping of address => assetId => placement */
    mapping(address => mapping(bytes32 => Placement)) public placements;

    /** Constructor */
    /// @param initialName the name of the contract
    constructor(string memory initialName) {
        name = initialName;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /** Place a piece according to a publisher. */
    /// @param encodedAssetId the external encoded asset id of the piece to place
    /// @param geohash the geohash of the location to place the piece
    /// @param timeRange the time range during which the piece is valid
    function place(
        EncodedAssetId calldata encodedAssetId,
        Geohash calldata geohash,
        TimeRange calldata timeRange
    ) external whenNotPaused {
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

    /** Place a piece according to a publisher, and set the scene URI, in one transaction. */
    /// @param encodedAssetId the external encoded asset id of the piece to place
    /// @param geohash the geohash of the location to place the piece
    /// @param timeRange the time range during which the piece is valid
    /// @param sceneUri the URI of the scene to show at the location
    function placeWithScene(
        EncodedAssetId calldata encodedAssetId,
        Geohash calldata geohash,
        TimeRange calldata timeRange,
        string calldata sceneUri
    ) external whenNotPaused {
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

    /** Place an asset inside another asset, making it available for use in scenes. */
    /// @param encodedAssetId the external encoded asset id of the piece to place
    /// @param parentAssetId the external asset id of the piece to place inside of
    /// @param timeRange the time range during which the piece is valid
    function placeInside(
        EncodedAssetId calldata encodedAssetId,
        bytes32 parentAssetId,
        TimeRange calldata timeRange
    ) external whenNotPaused {
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

    /** Remove an asset from the GSR */
    function remove(EncodedAssetId calldata encodedAssetId)
        external
        whenNotPaused
    {
        bytes32 assetId = _assetId(encodedAssetId);

        Placement storage placement = placements[_msgSender()][assetId];
        placement.published = false;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /// @dev Just update a sceneUri without changing the placement.
    /// @param encodedAssetId the external encoded asset id of the piece to place
    /// @param sceneUri the URI of the scene to show at the location
    function updateSceneUri(
        EncodedAssetId calldata encodedAssetId,
        string memory sceneUri
    ) external whenNotPaused {
        bytes32 assetId = _assetId(encodedAssetId);

        Placement storage placement = _findValidPlacement(
            assetId,
            _msgSender(),
            false
        );
        placement.sceneUri = sceneUri;

        _logPlacement(assetId, encodedAssetId, _msgSender(), placement);
    }

    /** Get the current location of an asset. */
    /// @param assetId the external asset id of the piece to get the location of the piece
    /// @param publisher the address of the publisher of the piece
    /// @return geohash - the location of the placement
    /// @return bitPrecision - the precision of the geohash
    /// @return startTime - the time this placement has been active since.
    function placeOf(bytes32 assetId, address publisher)
        external
        view
        returns (
            uint64 geohash,
            uint8 bitPrecision,
            uint256 startTime
        )
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

    /** Get the Scene URI metadata of a published asset. */
    /// @param assetId the external asset id of the piece to get the scene URI of
    /// @param publisher the address of the publisher of the piece
    function sceneURI(bytes32 assetId, address publisher)
        external
        view
        returns (string memory)
    {
        Placement storage placement = _findValidPlacement(
            assetId,
            publisher,
            true
        );

        return placement.sceneUri;
    }

    /** Check if an asset is within a bounding box using a geohash prefix. */
    /// @param boundingGeohash the geohash of the bounding box
    /// @param assetId the external asset id of the piece to check
    /// @param publisher the address of the publisher of the piece
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

    /** Check if an asset is currently placed within another asset. */
    /// @param assetId the external asset id of the piece to check
    /// @param parentAssetId the external asset id of the piece to check against
    /// @param publisher the address of the publisher of the piece
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

    /** Pause all activity. */
    function pause() external onlyOwner {
        _pause();
    }

    /** Unpause all activity. */
    function unpause() external onlyOwner {
        _unpause();
    }

    /** Look up a placement, and verify that it is valid. */
    /// @param assetId the external asset id of the piece to find the placement of
    /// @param publisher the address of the publisher of the piece
    /// @param followInside if true, recurse down to the parent placement

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

    /** Emit a placement event. */
    /// @param assetId the external asset id of the piece to emit the placement of
    /// @param encodedAssetId the encoded asset id of the piece to emit the placement of
    /// @param publisher the address of the publisher of the piece
    /// @param placement the placement to emit
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

    /** Calculate an asset ID from an encodedAssetId */
    /// @param encodedAssetId the encoded asset id of the piece to calculate the asset id of

    function _assetId(EncodedAssetId calldata encodedAssetId)
        private
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    encodedAssetId.assetType,
                    encodedAssetId.collectionId,
                    encodedAssetId.itemId
                )
            );
    }

    /** This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea. */
    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }

    /** Verify that a geohash and precision match. */
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

    /** Return the highest of two integers. */
    function _max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
