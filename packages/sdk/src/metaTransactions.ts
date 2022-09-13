import type { Contract } from "@ethersproject/contracts";
import type { Signer, TypedDataSigner } from "@ethersproject/abstract-signer";
import { object, string, Asserts, number } from "yup";

/** Validator schema for a metaTransaction */
export const metaTransactionSchema = object({
  r: string().required(),
  s: string().required(),
  v: number().required(),
  functionSignature: string().required(),
  address: string().lowercase().required(),
});

/** MetaTransaction data for a function call */
export type MetaTransaction = Asserts<typeof metaTransactionSchema>;

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

/** A Signer that can sign typed data */
export type TypedSigner = Signer & TypedDataSigner;

// Based on https://github.com/ProjectOpenSea/meta-transactions/blob/main/test/erc721-test.js
export const getTransactionData = async <T extends Contract, F extends keyof T>(
  contract: T,
  signer: TypedSigner,
  functionName: F,
  params: T[F] extends (...args: any[]) => any ? Parameters<T[F]> : never
): Promise<MetaTransaction> => {
  if (!signer.provider) {
    throw new Error("Signer must have a provider");
  }
  const address = await signer.getAddress();
  const name = await contract.name();
  const nonce = await contract.getNonce(address);
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
    from: address,
    functionSignature,
  };

  const types = {
    // EIP712Domain: domainType,
    MetaTransaction: metaTransactionType,
  };

  // eslint-disable-next-line no-underscore-dangle
  const signature = await signer._signTypedData(domainData, types, message);

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
    address,
  };
};
