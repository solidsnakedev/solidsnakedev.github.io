import { useState, useEffect } from 'react';

export default function TerminalPrompt() {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const fullText = 'user@terminal:~$ █';

  useEffect(() => {
    // Check if animation has played in this session
    const played = sessionStorage.getItem('promptPlayed');
    if (played) {
      setDisplayText(fullText);
      setCurrentIndex(fullText.length);
      setHasPlayed(true);
      return;
    }

    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else if (currentIndex === fullText.length && !hasPlayed) {
      sessionStorage.setItem('promptPlayed', 'true');
      setHasPlayed(true);
    }
  }, [currentIndex, hasPlayed]);

  // Skip animation on any keypress
  useEffect(() => {
    const handleKeyPress = () => {
      if (!hasPlayed) {
        setDisplayText(fullText);
        setCurrentIndex(fullText.length);
        sessionStorage.setItem('promptPlayed', 'true');
        setHasPlayed(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasPlayed]);

  return (
    <div className="text-amber-500 font-mono text-xl mb-4" role="presentation" aria-hidden="true">
      {displayText}
      <span className="cursor"></span>
    </div>
  );
}
