import { getInjectedCredentials } from "./injected-login";

export const getProvider = async () => {
  const { provider } = await getInjectedCredentials();
  return provider;
};
