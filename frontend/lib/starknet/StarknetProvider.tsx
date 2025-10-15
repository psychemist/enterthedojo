'use client';

import { StarknetConfig, publicProvider, argent, braavos, useInjectedConnectors } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import { PropsWithChildren, useMemo } from "react";
import { cartridgeConnector } from "@/lib/cartridge/CartridgeConnector";

export function StarknetProvider({ children }: PropsWithChildren) {
  const { connectors: injectedConnectors } = useInjectedConnectors({
    // Recommended connectors for Starknet
    recommended: [
      argent(),
      braavos(),
    ],
    // Include any other injected connectors
    includeRecommended: "always",
    // Order of preference
    order: "random",
  });

  // Combine Cartridge Controller with injected connectors
  const connectors = useMemo(() => {
    return [
      cartridgeConnector, // Cartridge Controller for cross-game identity
      ...injectedConnectors, // Argent X, Braavos, etc.
    ];
  }, [injectedConnectors]);

  console.log('Available Starknet connectors:', connectors.map(c => c.name || c.id));

  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}