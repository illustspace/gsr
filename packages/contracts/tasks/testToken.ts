/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const getContract = async (hre: HardhatRuntimeEnvironment) => {
  const [signer] = await hre.ethers.getSigners();

  const Contract = await hre.ethers.getContractFactory("TestToken");

  return Contract.attach(process.env.TEST_TOKEN_ADDRESS as string).connect(
    signer
  );
};

task("testToken:mint", "Mint a token")
  .addParam("to", "The address to mint to")
  .addParam("tokenId", "Token ID")
  .setAction(async ({ to, tokenId }: Record<string, string>, hre) => {
    const popContract = await getContract(hre);

    const tx = await popContract.mint(to, tokenId);

    await tx.wait();

    console.log("Done", tx.hash);
  });

task("testToken:burn", "Burn a token")
  .addParam("tokenId", "Token ID")
  .setAction(async ({ tokenId }: Record<string, string>, hre) => {
    const popContract = await getContract(hre);

    const tx = await popContract.burn(tokenId);

    await tx.wait();

    console.log("Done", tx.hash);
  });
