import axios from "axios";
import { Wallet } from "@ethersproject/wallet";
import { SerializedGsrPlacement } from "@geospatialregistry/sdk";

import { getApiEnv } from "~/features/config/apiEnv";
import { gsr } from "~/features/gsr/gsr-contract";
import { signWebhookMessage } from "./sign-webook";
import { prisma } from "../db";

/** Send webhooks to all registered endpoints. */
export const sendWebhooks = async (placements: SerializedGsrPlacement[]) => {
  // Get all active webhooks.
  const webhooks = await prisma.webhook.findMany({
    where: {
      active: true,
    },
  });

  // Send webhooks to all active webhooks.
  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      return sendWebhook(webhook.endpoint, placements);
    })
  );

  // Log failures
  webhooks.forEach(({ endpoint }, index) => {
    const result = results[index];
    if (result.status === "rejected") {
      console.error(`Webhook ${endpoint} failed to send`, result.reason);
    }
  });
};

/** Send a single webhook */
const sendWebhook = async (endpoint: string, placements: unknown) => {
  // Sign the webhook with the indexer's wallet.
  const signer = new Wallet(
    getApiEnv("metaTransactionRelayPrivateKey"),
    gsr.gsrProvider
  );

  // Sign the webhook and get back a stringified body.
  const { body, signature } = await signWebhookMessage(
    endpoint,
    placements,
    signer
  );

  // Send to the requested endpoint.
  await axios.post(endpoint, body, {
    headers: {
      // Pass the signature as a header.
      "gsr-signature": signature,
    },
  });
};
