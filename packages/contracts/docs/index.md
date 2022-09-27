# Solidity API

## GeoSpatialRegistry

A hyperstructure for registering the location and display data for a digital asset

### Geohash

```solidity
struct Geohash {
  uint64 geohash;
  uint8 bitPrecision;
}

```

### EncodedAssetId

```solidity
struct EncodedAssetId {
  bytes32 assetType;
  bytes collectionId;
  bytes itemId;
}

```

### TimeRange

```solidity
struct TimeRange {
  uint256 start;
  uint256 end;
}

```

### Placement

```solidity
struct Placement {
  bytes linkedPublisher;
  bool published;
  struct GeoSpatialRegistry.Geohash geohash;
  bytes32 parentAssetId;
  string sceneUri;
  uint256 placedAt;
  struct GeoSpatialRegistry.TimeRange timeRange;
}
```

### name

```solidity
string name
```

Contract name

### placements

```solidity
mapping(address => mapping(bytes32 => struct GeoSpatialRegistry.Placement)) placements
```

Stores asset placements for each publisher.

_Holds a mapping of publisherAddress => assetId => placement._

### GsrPlacement

```solidity
event GsrPlacement(bytes32 assetId, bytes32 parentAssetId, bytes32 collectionIdHash, struct GeoSpatialRegistry.EncodedAssetId fullAssetId, address publisher, bool published, struct GeoSpatialRegistry.Geohash geohash, string sceneUri, uint256 placedAt, struct GeoSpatialRegistry.TimeRange timeRange)
```

Describes a placement event.

#### Parameters

| Name             | Type                                     | Description                                                                      |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| assetId          | bytes32                                  | - the keccak256 hash of the encodedAssetId, used as the internal id.             |
| parentAssetId    | bytes32                                  | - Another asset this asset is placed inside of. If set, should override geohash. |
| collectionIdHash | bytes32                                  | - keccak256 hash of type of encodedAssetId.collectionId for search.              |
| fullAssetId      | struct GeoSpatialRegistry.EncodedAssetId | - Full assetId data for checking ownership.                                      |
| publisher        | address                                  | - Address that published this placement.                                         |
| published        | bool                                     | - If false, this change removes the existing placement.                          |
| geohash          | struct GeoSpatialRegistry.Geohash        | - Geohash of the placement location.                                             |
| sceneUri         | string                                   | - Optional URI describing the scene to show at the NFT's location.               |
| placedAt         | uint256                                  | - When the asset was placed.                                                     |
| timeRange        | struct GeoSpatialRegistry.TimeRange      | - The placement should only be considered active during this time range.         |

### constructor

```solidity
constructor(string initialName) public
```

Constructor

#### Parameters

| Name        | Type   | Description              |
| ----------- | ------ | ------------------------ |
| initialName | string | the name of the contract |

### place

```solidity
function place(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId, struct GeoSpatialRegistry.Geohash geohash, struct GeoSpatialRegistry.TimeRange timeRange) external
```

Place a piece according to a publisher.

#### Parameters

| Name           | Type                                     | Description                                          |
| -------------- | ---------------------------------------- | ---------------------------------------------------- |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the external encoded asset id of the piece to place. |
| geohash        | struct GeoSpatialRegistry.Geohash        | the geohash of the location to place the piece.      |
| timeRange      | struct GeoSpatialRegistry.TimeRange      | the time range during which the placement is valid.  |

### placeWithScene

```solidity
function placeWithScene(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId, struct GeoSpatialRegistry.Geohash geohash, struct GeoSpatialRegistry.TimeRange timeRange, string sceneUri) external
```

Place a piece according to a publisher, and set the scene URI, in one transaction.

#### Parameters

| Name           | Type                                     | Description                                          |
| -------------- | ---------------------------------------- | ---------------------------------------------------- |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the external encoded asset id of the piece to place. |
| geohash        | struct GeoSpatialRegistry.Geohash        | the geohash of the location to place the piece.      |
| timeRange      | struct GeoSpatialRegistry.TimeRange      | the time range during which the placement is valid.  |
| sceneUri       | string                                   | the URI of the scene to show at the location.        |

### placeInside

```solidity
function placeInside(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId, bytes32 parentAssetId, struct GeoSpatialRegistry.TimeRange timeRange) external
```

Place an asset inside another asset, making it available for use in scenes.

#### Parameters

| Name           | Type                                     | Description                                            |
| -------------- | ---------------------------------------- | ------------------------------------------------------ |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the external encoded asset id of the piece to place.   |
| parentAssetId  | bytes32                                  | the external asset id of the piece to place inside of. |
| timeRange      | struct GeoSpatialRegistry.TimeRange      | the time range during which the placement is valid.    |

### removePlacement

```solidity
function removePlacement(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId) external
```

Remove an asset from the GSR.

#### Parameters

| Name           | Type                                     | Description                                        |
| -------------- | ---------------------------------------- | -------------------------------------------------- |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the external encoded asset id of the piece remove. |

### updateSceneUri

```solidity
function updateSceneUri(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId, string sceneUri) external
```

Just update a sceneUri without changing the placement. This will not effect the placedAt time.

#### Parameters

| Name           | Type                                     | Description                                          |
| -------------- | ---------------------------------------- | ---------------------------------------------------- |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the external encoded asset id of the piece to place. |
| sceneUri       | string                                   | the URI of the scene to show at the location.        |

### placeOf

```solidity
function placeOf(bytes32 assetId, address publisher) external view returns (uint64 geohash, uint8 bitPrecision, uint256 startTime)
```

Get the current location of an asset.

#### Parameters

| Name      | Type    | Description                                                          |
| --------- | ------- | -------------------------------------------------------------------- |
| assetId   | bytes32 | the external asset id of the piece to get the location of the piece. |
| publisher | address | the address of the publisher of the piece.                           |

#### Return Values

| Name         | Type    | Description                                       |
| ------------ | ------- | ------------------------------------------------- |
| geohash      | uint64  | - the location of the placement.                  |
| bitPrecision | uint8   | - the precision of the geohash.                   |
| startTime    | uint256 | - the time this placement has been active since.. |

### sceneURI

```solidity
function sceneURI(bytes32 assetId, address publisher) external view returns (string)
```

Get the Scene URI metadata of a published asset.

#### Parameters

| Name      | Type    | Description                                                 |
| --------- | ------- | ----------------------------------------------------------- |
| assetId   | bytes32 | the external asset id of the piece to get the scene URI of. |
| publisher | address | the address of the publisher of the piece.                  |

#### Return Values

| Name | Type   | Description                                   |
| ---- | ------ | --------------------------------------------- |
| [0]  | string | the URI of the scene to show at the location. |

### isWithin

```solidity
function isWithin(struct GeoSpatialRegistry.Geohash boundingGeohash, bytes32 assetId, address publisher) external view returns (bool)
```

Check if an asset is within a bounding box using a geohash prefix.

#### Parameters

| Name            | Type                              | Description                                  |
| --------------- | --------------------------------- | -------------------------------------------- |
| boundingGeohash | struct GeoSpatialRegistry.Geohash | the geohash of the bounding box.             |
| assetId         | bytes32                           | the external asset id of the piece to check. |
| publisher       | address                           | the address of the publisher of the piece.   |

#### Return Values

| Name | Type | Description                                   |
| ---- | ---- | --------------------------------------------- |
| [0]  | bool | true if the asset is within the bounding box. |

### isInsideAsset

```solidity
function isInsideAsset(bytes32 assetId, bytes32 parentAssetId, address publisher) external view returns (bool)
```

Check if an asset is currently placed within another asset.

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| assetId       | bytes32 | the external asset id of the piece to check.         |
| parentAssetId | bytes32 | the external asset id of the piece to check against. |
| publisher     | address | the address of the publisher of the piece.           |

#### Return Values

| Name | Type | Description                                          |
| ---- | ---- | ---------------------------------------------------- |
| [0]  | bool | true if the asset is placed within the parent asset. |

### \_logPlacement

```solidity
function _logPlacement(bytes32 assetId, struct GeoSpatialRegistry.EncodedAssetId encodedAssetId, address publisher, struct GeoSpatialRegistry.Placement placement) internal
```

Emit a placement event for an off-chain indexer to read.

#### Parameters

| Name           | Type                                     | Description                                                  |
| -------------- | ---------------------------------------- | ------------------------------------------------------------ |
| assetId        | bytes32                                  | the external asset id of the piece to emit the placement of. |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the encoded asset id of the piece to emit the placement of.  |
| publisher      | address                                  | the address of the publisher of the piece.                   |
| placement      | struct GeoSpatialRegistry.Placement      | the placement to emit.                                       |

### \_findValidPlacement

```solidity
function _findValidPlacement(bytes32 assetId, address publisher, bool followInside) internal view returns (struct GeoSpatialRegistry.Placement)
```

Look up a placement, and verify that it is valid.

#### Parameters

| Name         | Type    | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| assetId      | bytes32 | the external asset id of the piece to find the placement of. |
| publisher    | address | the address of the publisher of the piece.                   |
| followInside | bool    | if true, recurse down to the parent placement.               |

### \_msgSender

```solidity
function _msgSender() internal view returns (address sender)
```

This is used instead of msg.sender to account for metaTransactions.

### \_assetId

```solidity
function _assetId(struct GeoSpatialRegistry.EncodedAssetId encodedAssetId) internal pure returns (bytes32)
```

Calculate an asset ID from an encodedAssetId

#### Parameters

| Name           | Type                                     | Description                                                    |
| -------------- | ---------------------------------------- | -------------------------------------------------------------- |
| encodedAssetId | struct GeoSpatialRegistry.EncodedAssetId | the encoded asset id of the piece to calculate the asset id of |

### \_verifyGeohash

```solidity
function _verifyGeohash(struct GeoSpatialRegistry.Geohash geohash) internal pure
```

Verify that a geohash and precision match.

#### Parameters

| Name    | Type                              | Description           |
| ------- | --------------------------------- | --------------------- |
| geohash | struct GeoSpatialRegistry.Geohash | the geohash to verify |

### \_max

```solidity
function _max(uint256 a, uint256 b) internal pure returns (uint256)
```

Return the highest of two integers.

## ContextMixin

https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/ContextMixin.sol

### msgSender

```solidity
function msgSender() internal view returns (address payable sender)
```

## Initializable

https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/Initializable.sol

### inited

```solidity
bool inited
```

### initializer

```solidity
modifier initializer()
```

## EIP712Base

https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/EIP712Base.sol

### EIP712Domain

```solidity
struct EIP712Domain {
  string name;
  string version;
  address verifyingContract;
  bytes32 salt;
}

```

### ERC712_VERSION

```solidity
string ERC712_VERSION
```

### EIP712_DOMAIN_TYPEHASH

```solidity
bytes32 EIP712_DOMAIN_TYPEHASH
```

### domainSeperator

```solidity
bytes32 domainSeperator
```

### \_initializeEIP712

```solidity
function _initializeEIP712(string name) internal
```

### \_setDomainSeperator

```solidity
function _setDomainSeperator(string name) internal
```

### getDomainSeperator

```solidity
function getDomainSeperator() public view returns (bytes32)
```

### getChainId

```solidity
function getChainId() public view returns (uint256)
```

### toTypedMessageHash

```solidity
function toTypedMessageHash(bytes32 messageHash) internal view returns (bytes32)
```

Accept message hash and returns hash message in EIP712 compatible form
So that it can be used to recover signer from signature signed using EIP712 formatted data
https://eips.ethereum.org/EIPS/eip-712
"\\x19" makes the encoding deterministic
"\\x01" is the version byte to make it compatible to EIP-191

## NativeMetaTransaction

https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/NativeMetaTransaction.sol

### META_TRANSACTION_TYPEHASH

```solidity
bytes32 META_TRANSACTION_TYPEHASH
```

### MetaTransactionExecuted

```solidity
event MetaTransactionExecuted(address userAddress, address payable relayerAddress, bytes functionSignature)
```

### nonces

```solidity
mapping(address => uint256) nonces
```

### MetaTransaction

```solidity
struct MetaTransaction {
  uint256 nonce;
  address from;
  bytes functionSignature;
}

```

### executeMetaTransaction

```solidity
function executeMetaTransaction(address userAddress, bytes functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV) public payable returns (bytes)
```

### hashMetaTransaction

```solidity
function hashMetaTransaction(struct NativeMetaTransaction.MetaTransaction metaTx) internal pure returns (bytes32)
```

### getNonce

```solidity
function getNonce(address user) public view returns (uint256 nonce)
```

### verify

```solidity
function verify(address signer, struct NativeMetaTransaction.MetaTransaction metaTx, bytes32 sigR, bytes32 sigS, uint8 sigV) internal view returns (bool)
```

## TestToken

Sample ERC-721 Token for testing

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(address to, uint256 tokenId) public
```

### burn

```solidity
function burn(uint256 tokenId) public
```

## AccountLinkRegistry

### AccountLink

```solidity
event AccountLink(address linkingAddress, bytes32 linkedService, bytes linkedAccount, bytes ownershipProof, bool isEscrowAccount)
```

### AccountLinkProof

```solidity
struct AccountLinkProof {
  bytes32 linkedService;
  bytes linkedAccount;
  bytes ownershipProof;
  bool isEscrowAccount;
  bool linked;
}

```

### name

```solidity
string name
```

Contract name

### accountLinks

```solidity
mapping(address => mapping(bytes32 => struct AccountLinkRegistry.AccountLinkProof)) accountLinks
```

Holds a mapping of address => targetId => AccountLinkProof

### constructor

```solidity
constructor(string initialName) public
```

#### Parameters

| Name        | Type   | Description              |
| ----------- | ------ | ------------------------ |
| initialName | string | the name of the contract |

### setLink

```solidity
function setLink(bytes linkedAccount, bytes ownershipProof, bool isEscrowAccount) external
```

#### Parameters

| Name            | Type  | Description                                                                         |
| --------------- | ----- | ----------------------------------------------------------------------------------- |
| linkedAccount   | bytes | Account service & ID on the remote service, abi encoded based on the linkedService. |
| ownershipProof  | bytes | Proof of account ownership on the service.                                          |
| isEscrowAccount | bool  | If true, decare the linkedAccount as an escrow account. \*/                         |

### unlink

```solidity
function unlink(bytes32 targetId) external
```

### \_msgSender

```solidity
function _msgSender() internal view returns (address sender)
```

This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
