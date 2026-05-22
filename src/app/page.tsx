'use client'

import { useState, useEffect } from "react";
import Game from "./components/Game";

export default function Home() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('disclaimerAccepted') === 'true') {
      setDisclaimerAccepted(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    sessionStorage.setItem('disclaimerAccepted', 'true');
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0F212E' }}>
        <Game />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0F212E' }}>
      <Game />

      {!disclaimerAccepted && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[9999]">
          <div className="bg-gradient-to-b from-red-900 to-red-800 rounded-lg p-6 max-w-md shadow-2xl text-center border-4 border-red-500" style={{ fontFamily: 'plinko_m' }}>
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-white text-3xl font-bold mb-4">NO REAL MONEY</h1>
            <p className="text-white text-sm mb-3">
              This is a demo. No real money is involved. Don&apos;t gamble with real money.
            </p>
            <button
              onClick={handleAcceptDisclaimer}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition duration-300"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
