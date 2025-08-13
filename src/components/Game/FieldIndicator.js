// src/components/Game/FieldIndicator.js
"use client";

export default function FieldIndicator({ currentField, fields, fieldTransitioning = false }) {
  const field = fields[currentField];
  if (!field) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none select-none">
      <div className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-cyan-500/60 bg-gradient-to-br from-cyan-900/60 to-cyan-800/40 backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.8)] transition-all ${fieldTransitioning ? 'ring-2 ring-cyan-300/50 scale-105' : ''}`}>
        <div className="relative w-9 h-9 flex items-center justify-center text-[1.35rem]">
          <span className="drop-shadow-md">{field.icon}</span>
          {fieldTransitioning && <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/30" />}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-bold text-cyan-100 tracking-wide uppercase">{field.name}</span>
          <span className="text-[11px] text-cyan-300/90 max-w-[16rem] truncate">{field.effect}</span>
        </div>
      </div>
    </div>
  );
}
