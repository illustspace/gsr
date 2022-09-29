export const chainIds = {
  eth: {
    mainnet: 1,
    ropsten: 3,
    rinkeby: 4,
  },
  polygon: {
    mainnet: 137,
    mumbai: 80001,
  },
};

export const chainIdToName: Record<number, string> = {
  1: "Ethereum",
  3: "Ropsten",
  4: "Rinkeby",
  137: "Polygon",
  80001: "Polygon Mumbai",
  1337: "Devnet",
};
