// src/components/Card/CardImage.js
"use client";

import Image from 'next/image';
import { useState } from 'react';

// Componente de imagem de carta com estados de carregamento e placeholder
export default function ImagemDaCarta({
  card,
  size = 'medium',
  showPlaceholder = true,
  className = '',
  onClick = null,
}) {
  // Estados locais: erro na imagem e carregamento
  const [erroNaImagem, definirErroNaImagem] = useState(false);
  const [carregandoImagem, definirCarregandoImagem] = useState(true);

  // Classes utilitárias por tamanho (mantemos as chaves para não quebrar a API)
  const classesDeTamanho = {
    small: 'w-16 h-20',
    medium: 'w-32 h-40',
    large: 'w-48 h-60',
    xl: 'w-64 h-80',
  };

  // Handlers de imagem
  const lidarComErroDaImagem = () => {
    definirErroNaImagem(true);
    definirCarregandoImagem(false);
  };

  const lidarComCarregamentoDaImagem = () => {
    definirCarregandoImagem(false);
  };

  // Conteúdo de placeholder quando não há imagem disponível
  const obterConteudoDoPlaceholder = () => {
    // Para cartas não descobertas, mantém o bloco de mistério
    if (!card.discovered) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-4xl mb-2">❓</div>
          <div className="text-xs text-center">Não descoberto</div>
        </div>
      );
    }
    // Placeholder genérico
    return (
      <Image
        src="/images/placeholder.svg"
        alt={`Placeholder de ${card.name}`}
        fill
        className="object-cover"
        onLoad={lidarComCarregamentoDaImagem}
      />
    );
  };

  return (
    <div
      className={`${classesDeTamanho[size]} ${className} relative overflow-hidden rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center cursor-pointer transition-all hover:scale-105`}
      onClick={onClick}
    >
      {/* Spinner de carregamento */}
      {carregandoImagem && !erroNaImagem && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Imagem da carta ou placeholder */}
      {card.discovered && card.images?.portrait && !erroNaImagem ? (
        <Image
          src={card.images.portrait}
          alt={card.name}
          fill
          className="object-cover"
          onError={lidarComErroDaImagem}
          onLoad={lidarComCarregamentoDaImagem}
          style={{ opacity: carregandoImagem ? 0 : 1 }}
        />
      ) : (
        showPlaceholder && obterConteudoDoPlaceholder()
      )}

      {/* Overlay de raridade */}
      {card.discovered && (
        <div className="absolute top-1 right-1">
          <div
            className={`text-xs px-1 rounded ${
              card.rarity === 'Mítico'
                ? 'bg-red-600'
                : card.rarity === 'Lendário'
                ? 'bg-yellow-600'
                : 'bg-purple-600'
            }`}
          >
            {card.rarity?.charAt(0)}
          </div>
        </div>
      )}

      {/* Overlay de tipo de carta */}
      {card.discovered && card.type !== 'creature' && (
        <div className="absolute bottom-1 left-1">
          <div className="text-xs bg-black/70 px-1 rounded">
            {card.type === 'spell' ? '✨' : '⚱️'}
          </div>
        </div>
      )}
    </div>
  );
}
