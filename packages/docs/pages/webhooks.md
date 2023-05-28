# Webhooks

If you have an application that relies on GSR placements, you may want to keep a
cache of valid placements in your own database.

To support this, the GSR indexer offers a webhook system. When any valid
placement (meaning it was placed by the asset's true owner) occurs on the smart
contract, the indexer can send a message to your API server with the placement
information. Your server can then decide if it wants to store that data or not.

To request webhooks, contact us as
[info@illust.agency](mailto:info@illust.agency) with the endpoint you would like
us to call, and a little information about your project.

## Example Express webhook endpoint

```ts
import {
  GsrContract,
  serializeGsrPlacement,
  ValidatedGsrPlacement,
} from "@geospatialregistry/sdk";
import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 3002;

const rawJsonParser = bodyParser.raw({ type: "application/octet-stream" });

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

app.listen(port, () => console.log(`App listening on port ${port}`));
```

Or see the
[example webhook consumer](https://github.com/illustspace/gsr/blob/develop/examples/webhook-consumer/src/index.ts)
for a full setup.

## Payload format

## Security
