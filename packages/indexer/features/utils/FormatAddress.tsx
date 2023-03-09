import React, { FunctionComponent } from "react";

export interface FormatAddressProps {
  address: string;
}

export const FormatAddress: FunctionComponent<FormatAddressProps> = ({
  address,
}) => {
  if (!address) return null;

  return (
    <span title={address}>
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
};
