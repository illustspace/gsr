import { Web3Provider } from "@ethersproject/providers";

export interface LoginDetails {
  provider: Web3Provider;
  account: string;
  username?: string;
  phone?: string;
  email?: string;
  disconnect: () => Promise<void>;
}
