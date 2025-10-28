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
        {/* Pequeno badge emoji no canto superior direito (estado amigável) */}
        <div className="absolute -top-3 -right-3 z-60 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-xs shadow-sm">
          <span aria-hidden>🙂</span>
        </div>

        {/* Balão de fala aprimorado: largura reduzida para forçar quebra de linha vertical */}
        <div 
          role="status"
          aria-live="polite"
          className={
            `
            bg-gradient-to-br from-green-800/95 to-emerald-900/95
            backdrop-blur-sm
            text-white text-sm
            px-4 py-4
            rounded-xl
            shadow-2xl shadow-black/60
            border border-emerald-400/30
            min-w-[1rem]
            max-w-[20rem]
            w-fit
            whitespace-pre-wrap
            break-words
            animate-scale-in
          `
          }
        >
          <p className="font-medium leading-relaxed italic text-sm">
            &ldquo;{frase}&rdquo;
          </p>
        </div>

        {/* Seta do balão (refinada) */}
        <div 
          className={`
            absolute w-0 h-0
            border-solid
            ${setas[posicao]}
          `}
          aria-hidden
        />

        {/* Brilho sutil interno */}
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }} />
      </div>
    </div>
  );
}
