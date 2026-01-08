import { useState, useEffect, useRef } from 'react';

/**
 * Hook for managing animations that should only play once per session
 * @param storageKey - SessionStorage key to track if animation has played
 * @returns Object with hasPlayed state and markAsPlayed function
 */
export function useSessionAnimation(storageKey: string) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const played = sessionStorage.getItem(storageKey);
      if (played) {
        setHasPlayed(true);
      }
      isInitialized.current = true;
    }
  }, [storageKey]);

  const markAsPlayed = () => {
    sessionStorage.setItem(storageKey, 'true');
    setHasPlayed(true);
  };

  return { hasPlayed, markAsPlayed };
}

/**
 * Hook for typewriter animation with session persistence
 * @param text - Text to type out
 * @param storageKey - SessionStorage key for tracking
 * @param delay - Delay between characters in ms
 * @returns Object with displayText and isComplete state
 */
export function useTypewriterAnimation(
  text: string,
  storageKey: string,
  delay: number = 80
) {
  const { hasPlayed, markAsPlayed } = useSessionAnimation(storageKey);
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  // Initialize display text based on session state
  useEffect(() => {
    if (hasPlayed) {
      setDisplayText(text);
      setIsComplete(true);
      indexRef.current = text.length;
    }
  }, [hasPlayed, text]);

  // Typewriter animation
  useEffect(() => {
    if (hasPlayed || isComplete) return;

    if (indexRef.current < text.length) {
      timeoutRef.current = window.setTimeout(() => {
        setDisplayText(prev => prev + text[indexRef.current]);
        indexRef.current++;
      }, delay);

      return () => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else if (indexRef.current === text.length) {
      setIsComplete(true);
      markAsPlayed();
    }
  }, [displayText, hasPlayed, isComplete, text, delay, markAsPlayed]);

  // Skip animation function
  const skip = () => {
    if (!isComplete) {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      setDisplayText(text);
      indexRef.current = text.length;
      setIsComplete(true);
      markAsPlayed();
    }
  };

  return { displayText, isComplete, skip };
}
