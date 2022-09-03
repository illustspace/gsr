import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Provider } from "@ethersproject/providers";
import { expect } from "chai";
import { InMemorySigner } from "@taquito/signer";
import { verifySignature } from "@taquito/utils";

import { AccountLinkRegistry__factory } from "@gsr/sdk/lib/esm/typechain/factories/AccountLinkRegistry__factory";
import { AccountLinkRegistry } from "@gsr/sdk/lib/esm/typechain/AccountLinkRegistry";
import {
  defaultAbiCoder,
  keccak256,
  toUtf8Bytes,
  toUtf8String,
  verifyMessage,
} from "ethers/lib/utils";

describe("CrossChainAccountRegistry", () => {
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  let alr: AccountLinkRegistry;

  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners();

    const accountLinkRegistryFactory = await ethers.getContractFactory(
      "AccountLinkRegistry"
    );

    const deployedContract = await accountLinkRegistryFactory.deploy(
      "AccountLinkRegistry"
    );

    alr = AccountLinkRegistry__factory.connect(
      deployedContract.address,
      admin.provider as Provider
    );
  });

  it("handles EVM accounts", async () => {
    const linkedService = keccak256(toUtf8Bytes("EVM"));

    const linkedAccount = defaultAbiCoder.encode(
      ["bytes32", "bytes"],
      [linkedService, user2.address]
    );

    const ownershipProof = await user2.signMessage(user1.address);

    await alr.connect(user1).setLink(linkedAccount, ownershipProof, false);

    const targetId = keccak256(linkedAccount);
    const accountLink = await alr.accountLinks(user1.address, targetId);

    const [, returnedLinkedAccount] = defaultAbiCoder.decode(
      ["bytes32", "bytes"],
      accountLink.linkedAccount
    );

    const messageSigner = verifyMessage(
      returnedLinkedAccount,
      accountLink.ownershipProof
    );

    expect(messageSigner.toLowerCase() === user2.address.toLowerCase());
  });

  it("handles Tezos", async () => {
    const signer = await InMemorySigner.fromSecretKey(
      "edsk2rKA8YEExg9Zo2qNPiQnnYheF1DhqjLVmfKdxiFfu5GyGRZRnb"
    );

    const tezosAccount = await signer.publicKey();

    const linkedService = keccak256(toUtf8Bytes("TEZOS"));
    const linkedAccount = defaultAbiCoder.encode(
      ["bytes32", "bytes"],
      [linkedService, toUtf8Bytes(tezosAccount)]
    );

    const { sig: ownershipProof } = await signer.sign(user1.address);

    // Forge the link
    await alr
      .connect(user1)
      .setLink(linkedAccount, toUtf8Bytes(ownershipProof), false);

    const targetId = keccak256(linkedAccount);
    // Get the new link
    const accountLink = await alr.accountLinks(user1.address, targetId);

    const [, returnedLinkedAccount] = defaultAbiCoder.decode(
      ["bytes32", "bytes"],
      accountLink.linkedAccount
    );

    expect(
      verifySignature(
        user1.address,
        toUtf8String(returnedLinkedAccount),
        toUtf8String(accountLink.ownershipProof)
      )
    ).to.eq(true);
  });
});
