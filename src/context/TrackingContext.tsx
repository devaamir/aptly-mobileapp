import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { trackAppointment, TrackData } from '../services/api';

interface TrackingContextType {
  trackingId: string | null;
  trackData: TrackData | null;
  currentToken: number | null;
  prevToken: number | null;
  nextToken: number | null;
  startTracking: (id: string) => void;
  stopTracking: () => void;
}

const TrackingContext = createContext<TrackingContextType>({
  trackingId: null,
  trackData: null,
  currentToken: null,
  prevToken: null,
  nextToken: null,
  startTracking: () => {},
  stopTracking: () => {},
});

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const connect = useCallback((id: string) => {
    stopRef.current?.();
    stopRef.current = trackAppointment(id, setTrackData, () => {
      // Auto-reconnect after 3s on error
      setTimeout(() => { if (trackingId === id) connect(id); }, 3000);
    });
  }, [trackingId]);

  useEffect(() => {
    if (!trackingId) { stopRef.current?.(); stopRef.current = null; setTrackData(null); return; }
    connect(trackingId);
    return () => { stopRef.current?.(); stopRef.current = null; };
  }, [trackingId]);

  // Pause SSE when app goes to background, resume when active
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (!trackingId) return;
      if (state === 'active') connect(trackingId);
      else { stopRef.current?.(); stopRef.current = null; }
    });
    return () => sub.remove();
  }, [trackingId, connect]);

  const startTracking = useCallback((id: string) => setTrackingId(id), []);
  const stopTracking = useCallback(() => setTrackingId(null), []);

  // ongoing = currently being served, pending = waiting in queue
  const ongoing = (trackData?.appointments ?? [])
    .filter(a => a.tokenStatus === 'ongoing')
    .sort((a, b) => b.tokenNumber - a.tokenNumber)[0];
  const maxCompleted = (trackData?.appointments ?? [])
    .filter(a => a.tokenStatus === 'completed')
    .reduce((max, a) => a.tokenNumber > max ? a.tokenNumber : max, 0);
  const ongoingNum = ongoing?.tokenNumber ?? 0;
  const currentToken = (ongoingNum > 0 || maxCompleted > 0)
    ? Math.max(ongoingNum, maxCompleted)
    : null;
  const pendingTokens = (trackData?.appointments ?? [])
    .filter(a => a.tokenStatus === 'pending')
    .map(a => a.tokenNumber)
    .sort((a, b) => a - b);
  const prevToken = currentToken !== null && currentToken > 1 ? currentToken - 1 : null;
  const nextToken = currentToken !== null ? (pendingTokens[0] ?? null) : null;

  return (
    <TrackingContext.Provider value={{ trackingId, trackData, currentToken, prevToken, nextToken, startTracking, stopTracking }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
