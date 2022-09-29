import { getEnv } from "../config/env";
import { getInjectedCredentials } from "./injected-login";

export const getProvider = async () => {
  const { provider } = await getInjectedCredentials(getEnv("gsrChainId"));
  return provider;
};
