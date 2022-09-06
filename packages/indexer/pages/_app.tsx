import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

function GsrApp({ Component }: AppProps) {
  return (
    <ChakraProvider>
      <Component />
    </ChakraProvider>
  );
}

export default GsrApp;
