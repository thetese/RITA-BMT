import { useEffect, useRef } from 'react';

const playBeep = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {}
};

export default function useBarcodeScanner(products, addToCart, isActive, onError) {
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      // Only process scans if actively on the POS checkout screen
      if (!isActive) return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTimeRef.current > 50) {
        barcodeBufferRef.current = '';
      }
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length > 0) {
          const scannedCode = barcodeBufferRef.current;
          
          let foundProduct = products.find(p => p.barcode === scannedCode);
          let priceOverride = null;

          // Check for price-embedded barcode (e.g., EAN-13 starting with 20-29)
          if (!foundProduct && scannedCode.length === 13 && /^2[0-9]/.test(scannedCode)) {
            const itemCodePrefix = scannedCode.substring(0, 7); 
            const embeddedValueStr = scannedCode.substring(7, 12);
            
            foundProduct = products.find(p => p.barcode && p.barcode.startsWith(itemCodePrefix));
            
            if (foundProduct) {
              priceOverride = parseInt(embeddedValueStr, 10);
            }
          }

          if (foundProduct) {
            addToCart(foundProduct, priceOverride);
            playBeep('success');
          } else {
            playBeep('error');
            if (onError) onError(`Barcode ${scannedCode} not found in database!`);
            else alert(`Barcode ${scannedCode} not found in database!`);
          }
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, addToCart, isActive]);
}
