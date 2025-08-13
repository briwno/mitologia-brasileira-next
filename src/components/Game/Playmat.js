// src/components/Game/Playmat.js
"use client";

import Image from 'next/image';

// Playmat using SVG asset for immersive board area.
export default function Playmat() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 px-4 select-none">
      <div className="relative w-full max-w-7xl aspect-[16/9]">
        <Image
          src="/images/playmat.svg"
          alt="Playmat"
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
