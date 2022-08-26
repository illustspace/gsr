# Illust Smart Contract Flow

## Ainsoph

This is our ERC721 NFT Contract, and handles storing tokenIds, transferring ownership, and distributing secondary market royalties.

It implements access control and pausing, and the ERC2981 royalty standard.

Assets can have one owner, and <= 95 royalty receivers, where each gets a percentage of the sale price. There is also an additional 5% marketplace fee.

Royalties are stored as percentages, and `royaltyReceiver` returns the total royalties, and a single address to send them to for third-party marketplaces.

Each NFT is minted with its royalty data.

To distribute royalties for a given sale, call `distributeRoyalties` with the total royalties to send percentages the listed receivers.

`verifyRoyalties` allows a contract to check that any primary sale meet or exceed the minted royalty amounts - so a primary sale can add extra percentages to the marketplace or artist, but cannot send less than the minted amounts.

See [test/Ainsoph.test.ts](./test/Ainsoph.test.ts) for a full walk through the contract.

### Access Control

This contract implements `AccessControlEnumerable` to allow addresses to grant specific roles to other addresses.

By default, the deployer of the smart contract gets the DEFAULT_ADMIN and MINTER roles.

#### DEFAULT_ADMIN

This allows the address to grant and revoke roles (including the admin role) for other users.

#### MINTER

This allows the address to mint NFTs. To allow general access to minting with this contract, you would need to set up a separate minting contract, and grant the MINTER role to that contract.

#### MARKETPLACE

This allows the address to trigger `transfer`s of NFTs on behalf of owners. Currently only the Illust Marketplace has the role, but in the future other marketplaces that agree to respect royalties can also be granted `MARKETPLACE`.

## Marketplace

This contract can be approved by NFT owners to transfer tokens on their behalf, and facilitates a seller approving a token for transfer to a specific buyer for an agreed-upon price. It also has logic for allowing higher primary sale royalties for a first sale or later special exhibition.

The flow after an off-chain auction is:

- Illust or artist calls `mintAsset` in the Ainsoph contract
- Illust calls `setRoyalties` to set higher primary sale royalties for the next payment. These must be the same or higher as the minted royalties for each receiver, but may include extra receivers.
- seller calls `setApprovalForAll` to approve trading through the marketplace
- have an off-chain auction to determine a price
- seller calls `acceptBid` to accept a specific bid amount from a specific address
- buyer calls `pay` to send the accepted bid amount for a token. The value is split between the `royaltyReceivers`. If there is a primary sale active, this uses those royalties. Otherwise, the royalties from the NFT are used.

See [test/IllustMarketplace.test.ts](./test/IllustMarketplace.test.ts) for a full walk through the contract.

### Access Control

This contract implements `AccessControlEnumerable` to allow addresses to grant specific roles to other addresses.

By default, the deployer of the smart contract gets the DEFAULT_ADMIN, MINTER, and PRIMARY_SALE roles.

#### DEFAULT_ADMIN

This allows the address to grant and revoke roles (including the admin role) for other users.

#### MINTER

This allows the address to set up open editions, allowing general users to mint versions of an open edition.

#### PRIMARY_SALE

This allows the address to set or change the primary sale split for any token. If a primary sale is set, then the next sale will use `primarySaleRoyaltyList` to distribute royalties, ignoring the Ainsoph3's royalty settings.
