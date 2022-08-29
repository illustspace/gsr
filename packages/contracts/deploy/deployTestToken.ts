/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

import { ethers, network } from "hardhat";
// eslint-disable-next-line func-names
module.exports = async function () {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("Deploying Test ERC721 contract");

  const TestToken = await ethers.getContractFactory("TestToken");
  console.log("deploying");
  const testToken = await TestToken.deploy();
  console.log("deployed and waiting");
  await testToken.deployed();
  console.log("deployed!");

  console.log("TestToken contract deployed to:", testToken.address);
};

module.exports.tags = ["testToken"];
