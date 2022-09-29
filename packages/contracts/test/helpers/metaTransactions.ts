import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { Contract } from "ethers";

/** MetaTransaction data for a function call */
export interface MetaTransaction {
  r: string;
  s: string;
  v: number;
  functionSignature: string;
}

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];

// Based on https://github.com/ProjectOpenSea/meta-transactions/blob/main/test/erc721-test.js
export const getTransactionData = async <T extends Contract, F extends keyof T>(
  contract: T,
  user: SignerWithAddress,
  functionName: F,
  params: T[F] extends (...args: any[]) => any ? Parameters<T[F]> : never
): Promise<MetaTransaction> => {
  const name = await contract.name();
  const nonce = await contract.getNonce(user.address);
  const version = "1";
  const chainId = await contract.getChainId();
  const salt = chainId.toHexString().substring(2).padStart(64, "0");

  const domainData = {
    name,
    version,
    verifyingContract: contract.address,
    salt: `0x${salt}`,
  };

  const functionSignature = contract.interface.encodeFunctionData(
    functionName as any,
    params as any
  );

  const message = {
    nonce: nonce.toNumber(),
    from: user.address,
    functionSignature,
  };

  const types = {
    // EIP712Domain: domainType,
    MetaTransaction: metaTransactionType,
  };

  // eslint-disable-next-line no-underscore-dangle
  const signature = await user._signTypedData(domainData, types, message);

  const r = signature.slice(0, 66);
  const s = "0x".concat(signature.slice(66, 130));
  const vString = "0x".concat(signature.slice(130, 132));
  let v = parseInt(vString, 16);
  if (![27, 28].includes(v)) v += 27;

  return {
    r,
    s,
    v,
    functionSignature,
  };
};
