import { Contract } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { GsrContract } from "@gsr/sdk";
import EthWallet from "ethereumjs-wallet";

const chainId = 1337;

describe("", () => {
  let owner1: EthWallet;
  let gsr: GsrContract;
  let signer: Wallet;

  beforeAll(() => {
    owner1 = EthWallet.generate();
    gsr = new GsrContract(
      {},
      {
        chainId,
      }
    );

    signer = new Wallet(owner1.getPrivateKey());
  });

  it("", async () => {
    const erc721 = new Contract("TODO", [], signer);

    await erc721.mint(owner1.getAddress(), 1);

    await gsr.place(
      signer,
      {
        assetType: "ERC721",
        chainId,
        contractAddress: erc721.address,
        tokenId: 1,
      },
      {
        geohash: 1,
        bitPrecision: 5,
      },
      {
        sceneUri: "https://example.com/scene.json",
        timeRange: {
          start: 0,
          end: new Date().getTime() / 1000 + 10_000,
        },
      }
    );
  });
});
