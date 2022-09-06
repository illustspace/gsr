export type ProviderService = "magic" | "walletConnect" | "injected";

const names: Record<ProviderService, string> = {
  magic: "Magic",
  injected: "Browser",
  walletConnect: "WalletConnect",
};

export const providerServiceName = (service: ProviderService) => {
  return names[service];
};
