import { InferType, number, object, string } from "yup";

const envSchema = object({
  /** Database connection string */
  databaseUrl: string().required(),
  /** How long to wait between sync requests. */
  syncRateLimitMs: number().required(),
  /** Private key of MetaTx relayer */
  metaTransactionRelayPrivateKey: string().required(),
});

interface ApiEnv extends InferType<typeof envSchema> {}

const apiEnv = setApiEnv();

/** Look up a secret environment value for the API. */
export function getApiEnv<T extends keyof ApiEnv>(key: T): ApiEnv[T] {
  return apiEnv[key];
}

function setApiEnv(): ApiEnv {
  const env: ApiEnv = {
    databaseUrl: process.env.DATABASE_URL as string,
    syncRateLimitMs: Number(process.env.SYNC_RATE_LIMIT_MS),
    metaTransactionRelayPrivateKey: process.env
      .META_TX_RELAY_PRIVATE_KEY as string,
  };

  return envSchema.validateSync(env);
}
