// express server
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import {
  GsrContract,
  serializeGsrPlacement,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";

const app = express();
const port = 3002;

// Logging
app.use(morgan("tiny"));

/**
 * Parser for the raw application/json webhook.
 * Use the raw data so we can verify the signature.
 */
const rawJsonParser = bodyParser.raw({ type: "application/json" });

const placements: {
  [assetId: string]: ValidatedGsrPlacement;
} = {};

/** GSR for devnet */
const gsr = new GsrContract(
  {},
  {
    // Hardhat network
    chainId: 1337,
  }
);

app.get("/placements/:assetId", async (req, res) => {
  const assetId = req.params.assetId as string;

  const placement = placements[assetId];

  if (!placement) {
    res.status(404).send("Placement not found");
    return;
  }

  res.status(200).send(serializeGsrPlacement(placement));
});

/** Accepts webhooks from the GSR Indexer */
app.post("/gsr/webhook", rawJsonParser, async (req, res) => {
  const body = req.body.toString();
  const signature = req.headers["gsr-signature"] as string;

  try {
    // Validate and parse the webhook message.
    const newPlacements = gsr.verifyPlacementWebhookMessage(
      body,
      signature,
      "http://localhost:3002/gsr/webhook"
    );

    // Update the placement db.
    newPlacements.forEach(updatePlacement);
  } catch (error) {
    console.error("Invalid webhook", error);
    res.status(400).send("Invalid webhook");
  }

  res.status(201).send("ok");
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}`));

/** Update the in-memory placement DB with a new placement. */
function updatePlacement(newPlacement: ValidatedGsrPlacement) {
  // Get the current placement for the asset, if any.
  const currentPlacement = placements[newPlacement.assetId];

  // Save the new placement if is does not exist already
  if (!currentPlacement) {
    // Ignore "unpublished" placements that do not exist yet.
    if (newPlacement.published) {
      placements[newPlacement.assetId] = newPlacement;
    }
    return;
  }

  // Ignore placements older than the current one.
  if (currentPlacement.placedAt > newPlacement.placedAt) {
    return;
  }

  // If the new placement revokes the previous one, remove it.
  if (!newPlacement.published) {
    delete placements[newPlacement.assetId];
    return;
  }

  // Update the placement
  placements[newPlacement.assetId] = newPlacement;
}
