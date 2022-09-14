/* eslint-disable import/no-extraneous-dependencies */

import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from "hardhat/config";
import "tsconfig-paths/register"; // Allow aliases in tests.
import "@typechain/hardhat";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "solidity-coverage";

import "./tasks/testToken";

import * as dotenv from "dotenv";

dotenv.config();

const reportGas = process.env.REPORT_GAS === "true";

//0xabc558C3f3f39d9Dad08b0D3e84d5Bcf578b6D00
const testPrivateKey =
  "04902883ed8f339672b55a151e3cf9c3277aaa30304604ed6851aa3d3807c555";

const alchemyApiKey = process.env.ALCHEMY_API_KEY as string;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY as string;
const polyscanApiKey = process.env.POLYSCAN_API_KEY as string;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      // To work with metamask
      chainId: 1337,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY
          ? process.env.TESTNET_PRIVATE_KEY
          : testPrivateKey,
      ],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY
          ? process.env.TESTNET_PRIVATE_KEY
          : testPrivateKey,
      ],
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY
          ? process.env.TESTNET_PRIVATE_KEY
          : testPrivateKey,
      ],
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY
          ? process.env.TESTNET_PRIVATE_KEY
          : testPrivateKey,
      ],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [process.env.MAINNET_PRIVATE_KEY || testPrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      // Ethereum
      mainnet: etherscanApiKey,
      ropsten: etherscanApiKey,
      rinkeby: etherscanApiKey,
      goerli: etherscanApiKey,
      kovan: etherscanApiKey,
      // Polygon
      polygon: polyscanApiKey,
      polygonMumbai: polyscanApiKey,
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: reportGas,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  typechain: {
    outDir: "../sdk/src/typechain",
    target: "ethers-v5",
  },
};

export default config;
