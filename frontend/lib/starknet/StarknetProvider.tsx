'use client';

import { StarknetConfig, publicProvider } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { PropsWithChildren } from "react";

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}