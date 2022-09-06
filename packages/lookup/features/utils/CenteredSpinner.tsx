import { Center, Spinner, CenterProps } from "@chakra-ui/react";
import React, { FunctionComponent } from "react";

export interface CenteredSpinnerProps extends CenterProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/** Render a spinner in the center of the containing element. */
export const CenteredSpinner: FunctionComponent<CenteredSpinnerProps> = ({
  size = "xl",
  color,
  ...props
}) => {
  return (
    <Center width="100%" height="100%" {...props}>
      <Spinner size={size} color={color as string} />
    </Center>
  );
};
