import { useEffect, useRef, useState } from 'react';

export function useAutoSave(callback, delay = 1500) {
  const [status, setStatus] = useState('idle'); // idle | saving | saved
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const trigger = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('saving');
    
    timeoutRef.current = setTimeout(async () => {
      try {
        await callbackRef.current();
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        setStatus('idle');
        throw err;
      }
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { trigger, status };
}
