// src/components/UI/LoadingSpinner.js
"use client";
import Image from 'next/image';

// Componente de carregamento com logo e barra animada
export default function SpinnerDeCarregamento({ text = '' }) {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Logo */}
      <Image
        src="/logo.svg"
        alt="Logotipo"
        width={80}
        height={80}
        className="w-20 h-20 mb-4 animate-pulse"
        priority
      />
      {/* Barra de progresso */}
      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 animate-loading-bar" />
      </div>
      {text && (
        <p className="mt-3 text-gray-300 text-sm">{text}</p>
      )}
      {/* Estilo para animação da barra */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          width: 50%;
          animation: loading-bar 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
