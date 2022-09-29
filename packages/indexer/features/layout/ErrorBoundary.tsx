import React, { Component, ErrorInfo, ReactNode } from "react";
import { Center, Heading } from "@chakra-ui/react";
import { getErrorMessage } from "./getErrorMessage";

export interface ErrorBoundaryProps {
  errorMessage?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: string;
  hasError: boolean;
}

/**
 * Component for isolating errors.
 * Note that this must be a class component https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: "", hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error: getErrorMessage(error) || "Something went wrong",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, errorMessage } = this.props;

    if (hasError) {
      return (
        <Center>
          <Heading as="h2">{errorMessage || error}</Heading>
        </Center>
      );
    }

    return children;
  }
}
