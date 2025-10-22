/**
 * BattleDecorations
 * Elementos decorativos temáticos para a tela de batalha
 * Adiciona galhos, folhas e partículas flutuantes inspiradas no folclore brasileiro
 */
export default function BattleDecorations() {
  return (
    <>
      {/* Galho Superior Esquerdo */}
      <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none opacity-30">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M0,0 Q50,30 80,60 Q90,70 100,90 Q110,110 120,130"
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="4"
            fill="none"
            className="drop-shadow-lg"
          />
          <path
            d="M80,60 Q100,50 120,55"
            stroke="rgba(139, 69, 19, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="120" cy="55" r="8" fill="rgba(34, 139, 34, 0.6)" />
          <circle cx="130" cy="60" r="6" fill="rgba(34, 139, 34, 0.5)" />
        </svg>
      </div>

      {/* Galho Superior Direito */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-30 scale-x-[-1]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M0,0 Q50,30 80,60 Q90,70 100,90 Q110,110 120,130"
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="4"
            fill="none"
            className="drop-shadow-lg"
          />
          <path
            d="M80,60 Q100,50 120,55"
            stroke="rgba(139, 69, 19, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="120" cy="55" r="8" fill="rgba(34, 139, 34, 0.6)" />
          <circle cx="130" cy="60" r="6" fill="rgba(34, 139, 34, 0.5)" />
        </svg>
      </div>

      {/* Galho Inferior Esquerdo */}
      <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-30 scale-y-[-1]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M0,0 Q50,30 80,60 Q90,70 100,90 Q110,110 120,130"
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="4"
            fill="none"
            className="drop-shadow-lg"
          />
          <path
            d="M80,60 Q100,50 120,55"
            stroke="rgba(139, 69, 19, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="120" cy="55" r="8" fill="rgba(34, 139, 34, 0.6)" />
          <circle cx="130" cy="60" r="6" fill="rgba(34, 139, 34, 0.5)" />
        </svg>
      </div>

      {/* Galho Inferior Direito */}
      <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none opacity-30 scale-[-1]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M0,0 Q50,30 80,60 Q90,70 100,90 Q110,110 120,130"
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="4"
            fill="none"
            className="drop-shadow-lg"
          />
          <path
            d="M80,60 Q100,50 120,55"
            stroke="rgba(139, 69, 19, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="120" cy="55" r="8" fill="rgba(34, 139, 34, 0.6)" />
          <circle cx="130" cy="60" r="6" fill="rgba(34, 139, 34, 0.5)" />
        </svg>
      </div>

      {/* Partículas Flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Partícula 1 - Verde */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float-slow" />
        
        {/* Partícula 2 - Azul */}
        <div className="absolute top-[40%] left-[85%] w-3 h-3 bg-cyan-400/20 rounded-full animate-float-medium" />
        
        {/* Partícula 3 - Amarela */}
        <div className="absolute top-[60%] left-[15%] w-2 h-2 bg-yellow-400/25 rounded-full animate-float-fast" />
        
        {/* Partícula 4 - Roxa */}
        <div className="absolute top-[75%] left-[90%] w-2 h-2 bg-purple-400/20 rounded-full animate-float-slow" />
        
        {/* Partícula 5 - Verde */}
        <div className="absolute top-[30%] left-[50%] w-1 h-1 bg-emerald-300/40 rounded-full animate-float-medium" />
        
        {/* Partícula 6 - Laranja */}
        <div className="absolute top-[85%] left-[45%] w-2 h-2 bg-orange-400/15 rounded-full animate-float-fast" />
      </div>

      {/* Estilos de animação inline (caso não estejam no Tailwind) */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-30px) translateX(15px); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-15px) translateX(-10px); }
          66% { transform: translateY(-25px) translateX(8px); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-10px) translateX(5px) rotate(90deg); }
          50% { transform: translateY(-20px) translateX(-8px) rotate(180deg); }
          75% { transform: translateY(-15px) translateX(12px) rotate(270deg); }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
