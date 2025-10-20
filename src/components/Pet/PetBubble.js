// src/components/Pet/PetBubble.js
// Balão de fala do mascote

"use client";

export default function PetBubble({ 
  frase, 
  visivel = true,
  posicao = 'top', // top, bottom, left, right
  className = ''
}) {
  if (!visivel || !frase) return null;

  const posicoes = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  const setas = {
    top: 'border-t-green-800/90 border-t-8 border-x-transparent border-x-8 border-b-0 left-1/2 -translate-x-1/2 top-full',
    bottom: 'border-b-green-800/90 border-b-8 border-x-transparent border-x-8 border-t-0 left-1/2 -translate-x-1/2 bottom-full',
    left: 'border-l-green-800/90 border-l-8 border-y-transparent border-y-8 border-r-0 top-1/2 -translate-y-1/2 left-full',
    right: 'border-r-green-800/90 border-r-8 border-y-transparent border-y-8 border-l-0 top-1/2 -translate-y-1/2 right-full'
  };

  return (
    <div 
      className={`
        absolute ${posicoes[posicao]} z-50
        animate-fade-in
        ${className}
      `}
    >
      <div className="relative">
        {/* Balão de fala */}
        <div 
          className="
            bg-gradient-to-br from-green-800/90 to-emerald-900/90
            backdrop-blur-sm
            text-white text-sm
            px-4 py-3
            rounded-lg
            shadow-xl shadow-black/50
            border border-green-400/30
            max-w-xs
            whitespace-normal
            animate-scale-in
          "
        >
          <p className="font-medium leading-relaxed italic">
            &ldquo;{frase}&rdquo;
          </p>
        </div>

        {/* Seta do balão */}
        <div 
          className={`
            absolute w-0 h-0
            border-solid
            ${setas[posicao]}
          `}
        />

        {/* Brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-300/10 to-transparent rounded-lg pointer-events-none" />
      </div>
    </div>
  );
}
