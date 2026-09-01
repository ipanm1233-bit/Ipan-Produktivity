import { useState, useEffect, useCallback } from 'react';

export interface TabletOrientationState {
  isTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  screenDimensions: { width: number; height: number };
  requestLandscape: () => Promise<boolean>;
  canLockOrientation: boolean;
}

export function useTabletOrientation(): TabletOrientationState {
  const checkIsTablet = (): boolean => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent.toLowerCase();
    const isIPad = /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidTablet = /android/.test(ua) && !/mobile/.test(ua);
    const isOtherTablet = /tablet|kindle|playbook|silk/.test(ua);

    const minDim = Math.min(window.innerWidth, window.innerHeight);
    const maxDim = Math.max(window.innerWidth, window.innerHeight);
    
    // Physical or viewport dimensions characteristic of tablets (typically 600px - 1366px min/max)
    const hasTabletDimensions = minDim >= 600 && maxDim <= 1400;
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

    return isIPad || isAndroidTablet || isOtherTablet || (hasTouch && hasTabletDimensions);
  };

  const getOrientation = () => {
    if (typeof window === 'undefined') {
      return { isPortrait: false, isLandscape: true, width: 1024, height: 768 };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    return {
      isPortrait,
      isLandscape: !isPortrait,
      width,
      height,
    };
  };

  const [state, setState] = useState(() => {
    const isTablet = checkIsTablet();
    const { isPortrait, isLandscape, width, height } = getOrientation();
    return {
      isTablet,
      isPortrait,
      isLandscape,
      isTabletPortrait: isTablet && isPortrait,
      isTabletLandscape: isTablet && isLandscape,
      screenDimensions: { width, height },
    };
  });

  const updateState = useCallback(() => {
    const isTablet = checkIsTablet();
    const { isPortrait, isLandscape, width, height } = getOrientation();

    setState({
      isTablet,
      isPortrait,
      isLandscape,
      isTabletPortrait: isTablet && isPortrait,
      isTabletLandscape: isTablet && isLandscape,
      screenDimensions: { width, height },
    });
  }, []);

  useEffect(() => {
    updateState();

    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(orientation: portrait)');
      if (mql?.addEventListener) {
        mql.addEventListener('change', updateState);
      }
    } catch (e) {
      // ignore
    }

    if (screen.orientation && typeof screen.orientation.addEventListener === 'function') {
      screen.orientation.addEventListener('change', updateState);
    }

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
      if (mql?.removeEventListener) {
        mql.removeEventListener('change', updateState);
      }
      if (screen.orientation && typeof screen.orientation.removeEventListener === 'function') {
        screen.orientation.removeEventListener('change', updateState);
      }
    };
  }, [updateState]);

  const canLockOrientation = typeof screen !== 'undefined' && 
    Boolean(screen.orientation && typeof (screen.orientation as any).lock === 'function');

  const requestLandscape = useCallback(async (): Promise<boolean> => {
    try {
      // If screen orientation lock API is available
      if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
        try {
          await (screen.orientation as any).lock('landscape');
          updateState();
          return true;
        } catch (err) {
          // Some browsers require entering fullscreen first before locking orientation
          if (document.documentElement.requestFullscreen) {
            try {
              await document.documentElement.requestFullscreen();
              await (screen.orientation as any).lock('landscape');
              updateState();
              return true;
            } catch (fsErr) {
              console.warn('Fullscreen + orientation lock failed:', fsErr);
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.warn('Orientation request error:', error);
      return false;
    }
  }, [updateState]);

  return {
    ...state,
    requestLandscape,
    canLockOrientation,
  };
}
