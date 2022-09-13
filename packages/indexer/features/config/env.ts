import { validateApiConfig } from "./validateApiConfig";

interface Env {
  alchemyApiKey: string;
  infuraId: string;
  gsrChainId: number;
  mapboxApiKey: string;
  mapboxStyleUrl: string;
}

const env = setEnv();

/** Look up an environment value. */
export function getEnv<T extends keyof Env>(key: T): Env[T] {
  return env[key];
}

function setEnv(): Env {
  const env: Env = {
    alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID as string,
    gsrChainId: Number(process.env.NEXT_PUBLIC_GSR_CHAIN_ID),
    mapboxApiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string,
    mapboxStyleUrl: process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL as string,
  };

  validateApiConfig("client", env);

  return env;
}
