// src/components/Game/Playmat.js
"use client";

import Image from 'next/image';

// Playmat using SVG asset for immersive board area.
export default function Playmat({ transitioning = false }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 px-4 select-none">
      <div className="relative w-full max-w-[1500px] aspect-[16/9]">
        <Image
          src="/images/playmat.svg"
          alt="Playmat"
          fill
          priority
          className="object-contain"
        />
        {transitioning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 rounded-full bg-cyan-400/10 border border-cyan-300/30 animate-ping" />
            <div className="absolute w-40 h-40 rounded-full bg-cyan-300/20 blur-xl animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
