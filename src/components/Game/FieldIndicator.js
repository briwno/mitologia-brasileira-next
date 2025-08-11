// src/components/Game/FieldIndicator.js
"use client";

export default function FieldIndicator({ currentField, fields, fieldTransitioning = false }) {
  const field = fields[currentField];
  
  if (!field) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
      {/* Indicador principal do campo */}
      <div className={`flex items-center gap-2 bg-black/60 px-4 py-1 rounded-full border-2 border-yellow-400 shadow-lg transition-all duration-300 ${fieldTransitioning ? 'scale-110 animate-pulse' : ''}`}>
        <span className="text-2xl">{field.icon}</span>
        <span className="font-bold text-yellow-100">{field.name}</span>
      </div>
      
      {/* Efeito do campo */}
      <div className="text-xs text-yellow-200 mt-1 text-center">
        {field.effect}
      </div>
    </div>
  );
}
