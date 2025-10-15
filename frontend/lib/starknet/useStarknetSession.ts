'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

// Session configuration
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

interface SessionData {
  address: string;
  connectorId: string;
  timestamp: number;
  lastActivity: number;
}

/**
 * Hook to manage Starknet wallet session with expiry and auto-refresh
 */
export function useStarknetSession() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Save session
  const saveSession = useCallback((addr: string, connId: string) => {
    const sessionData: SessionData = {
      address: addr,
      connectorId: connId,
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };
    localStorage.setItem('starknet_session', JSON.stringify(sessionData));
    setSessionExpiry(Date.now() + SESSION_TIMEOUT);
    setSessionWarning(false);
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const sessionStr = localStorage.getItem('starknet_session');
    if (sessionStr) {
      try {
        const session: SessionData = JSON.parse(sessionStr);
        session.lastActivity = Date.now();
        localStorage.setItem('starknet_session', JSON.stringify(session));
        setSessionWarning(false);
      } catch (e) {
        console.error('Failed to update activity:', e);
      }
    }
  }, []);

  // Check if session is expired
  const isSessionExpired = useCallback((session: SessionData): boolean => {
    const age = Date.now() - session.timestamp;
    const inactivity = Date.now() - session.lastActivity;
    return age > SESSION_TIMEOUT || inactivity > INACTIVITY_TIMEOUT;
  }, []);

  // Check if session is expiring soon (within 10 minutes)
  const isSessionExpiringSoon = useCallback((session: SessionData): boolean => {
    const age = Date.now() - session.timestamp;
    const inactivity = Date.now() - session.lastActivity;
    const timeUntilExpiry = SESSION_TIMEOUT - age;
    const timeUntilInactivityExpiry = INACTIVITY_TIMEOUT - inactivity;
    const minTimeLeft = Math.min(timeUntilExpiry, timeUntilInactivityExpiry);
    return minTimeLeft < 10 * 60 * 1000; // Less than 10 minutes
  }, []);

  // Refresh session (extend expiry)
  const refreshSession = useCallback(() => {
    if (address && connector) {
      updateActivity();
      setSessionExpiry(Date.now() + SESSION_TIMEOUT);
      setSessionWarning(false);
    }
  }, [address, connector, updateActivity]);

  // Disconnect and clear session
  const disconnectSession = useCallback(() => {
    disconnect();
    localStorage.removeItem('starknet_session');
    setSessionExpiry(null);
    setSessionWarning(false);
  }, [disconnect]);

  // Save session when wallet connects
  useEffect(() => {
    if (isConnected && address && connector) {
      saveSession(address, connector.id);
    }
  }, [isConnected, address, connector, saveSession]);

  // Check and restore session on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem('starknet_session');
    if (sessionStr && !isConnected) {
      try {
        const session: SessionData = JSON.parse(sessionStr);
        
        if (isSessionExpired(session)) {
          // Session expired, clean up
          localStorage.removeItem('starknet_session');
          console.log('Starknet session expired');
        } else {
          // Try to restore session
          const savedConnector = connectors.find(c => c.id === session.connectorId);
          if (savedConnector) {
            connect({ connector: savedConnector });
            setSessionExpiry(session.timestamp + SESSION_TIMEOUT);
          }
        }
      } catch (e) {
        console.error('Failed to restore Starknet session:', e);
        localStorage.removeItem('starknet_session');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic session check
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const sessionStr = localStorage.getItem('starknet_session');
      if (sessionStr) {
        try {
          const session: SessionData = JSON.parse(sessionStr);
          
          if (isSessionExpired(session)) {
            // Session expired, disconnect
            console.log('Session expired, disconnecting...');
            disconnectSession();
          } else if (isSessionExpiringSoon(session)) {
            // Warn user about expiring session
            setSessionWarning(true);
          } else {
            // Update activity timestamp
            updateActivity();
          }
        } catch (e) {
          console.error('Session check failed:', e);
        }
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected, isSessionExpired, isSessionExpiringSoon, updateActivity, disconnectSession]);

  // Activity listeners - update activity on user interactions
  useEffect(() => {
    if (!isConnected) return;

    const handleActivity = () => {
      updateActivity();
    };

    // Listen to common user activity events
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('mousemove', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
    };
  }, [isConnected, updateActivity]);

  return {
    sessionExpiry,
    sessionWarning,
    refreshSession,
    disconnectSession,
    isConnected,
    address,
  };
}
