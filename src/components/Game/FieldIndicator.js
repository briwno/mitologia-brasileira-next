// src/components/Game/FieldIndicator.js
"use client";

// Indicador do campo/terreno atual com estado de transição
export default function IndicadorDeCampo({ currentField, fields, fieldTransitioning = false }) {
  const campo = fields[currentField];
  if (!campo) return null;

  return (
  <div className="flex flex-col items-center pointer-events-none select-none">
      <div
        className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-cyan-500/60 bg-gradient-to-br from-cyan-900/60 to-cyan-800/40 backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.8)] transition-all ${
          fieldTransitioning ? 'ring-2 ring-cyan-300/50 scale-105' : ''
        }`}
      >
        <div className="relative w-9 h-9 flex items-center justify-center text-[1.35rem]">
          <span className="drop-shadow-md">{campo.icon}</span>
          {fieldTransitioning && <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/30" />}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-bold text-cyan-100 tracking-wide uppercase">{campo.name}</span>
          <span className="text-[11px] text-cyan-300/90 max-w-[16rem] truncate">{campo.effect}</span>
        </div>
      </div>
    </div>
  );
}
