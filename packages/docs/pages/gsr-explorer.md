# GSR Explorer

The [GSR Explorer](https://indexer.gsr.network) is a site for viewing the raw
placement data contained within the GSR Smart Contract. You can think of it as
the Etherscan for the GSR.

This site contains every placement (valid or not), a list of all recent
placements, and a simple interface for manually performing placements.

It's also a great place to link to from your site to prove that an asset is
placed on the GSR, and gives history of the asset's previous placements.

## Placement links

If your application shows assets that are geolocated on the GSR, you should show
that off to your users! Simply show a link to
`indexer.gsr.network/assets/:assetId`, like
[indexer.gsr.network/assets/0xab5e533614901f7d107ae7bbe3054e653aa37db32e864efd5ec70d8718bfa912](https://indexer.gsr.network/assets/0xab5e533614901f7d107ae7bbe3054e653aa37db32e864efd5ec70d8718bfa912).

You can generate this link using the SDK with:

```ts
gsrIndexer.explorer.asset(assetId);
```

## New Placement interface

We expect that most placement will be done via a web/app interface inside
applications. However, you can always place directly on the smart contract. To
make this easy, go to
[https://indexer.gsr.network/place](https://indexer.gsr.network/place), enter an
asset type and asset ID information, and search for an existing placement. Then
you can set a new location with the map, optionally add a SceneURI link to a
JSON file, and click publish. Then you sign the transaction, and your placement
is published on the blockchain.
