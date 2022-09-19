import type { Signer } from "@ethersproject/abstract-signer";

/** Sign a webhook as the indexer. */
export async function signWebhookMessage(
  endpoint: string,
  payload: unknown,
  signer: Signer
) {
  const body = JSON.stringify({
    payload,
    endpoint,
  });

  const signature = await signer.signMessage(body);

  return {
    body,
    signature,
  };
}
