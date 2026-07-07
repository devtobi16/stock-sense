import { useState, useEffect } from 'react';

const DEFAULT_MESSAGES = [
  'Retrieving the latest market data...',
  'Updating financial information...',
  'Preparing your research report...',
  'Analyzing the latest company filings...',
  'Reviewing recent earnings results...',
  'Synchronizing market information...',
  'Compiling financial metrics...',
  'Generating AI research insights...',
  'Updating company fundamentals...',
  'Loading investment analysis...',
  'Preparing financial statements...',
  'Gathering the latest disclosures...',
  'Building your report...',
  'Checking for newly released filings...',
  'Finalizing research summary...'
];

export function useLoadingMessage(customMessages?: string[], intervalMs = 2500) {
  const messages = customMessages || DEFAULT_MESSAGES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Pick a random starting point
    setIndex(Math.floor(Math.random() * messages.length));
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  return messages[index];
}
