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
  // Sempre mostra placeholder padrão (removida lógica de descoberta)
    // Placeholder genérico
    return (
      <Image
        src="/images/placeholder.svg"
        alt={`Placeholder de ${card.nome || card.name}`}
        fill
        className="object-cover"
        onLoad={lidarComCarregamentoDaImagem}
      />
    );
  };

  return (
    <div
  className={`${classesDeTamanho[size]} ${className} relative overflow-hidden rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 flex items-center justify-center cursor-pointer`}
      onClick={onClick}
    >
      {/* Spinner de carregamento */}
      {carregandoImagem && !erroNaImagem && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Imagem da carta ou placeholder */}
    {(card.imagens?.retrato || card.images?.portrait) && !erroNaImagem ? (
        <Image
          src={card.imagens?.retrato || card.images?.portrait}
          alt={card.nome || card.name}
          fill
          className="object-cover"
          sizes={size === 'small' ? '80px' : size === 'medium' ? '160px' : size === 'large' ? '220px' : '320px'}
          quality={90}
          onError={lidarComErroDaImagem}
          onLoad={lidarComCarregamentoDaImagem}
          style={{ opacity: carregandoImagem ? 0 : 1 }}
        />
      ) : (
        showPlaceholder && obterConteudoDoPlaceholder()
      )}

      {/* Overlay de raridade */}
  {(
        <div className="absolute top-1 right-1">
          <div
            className={`text-xs px-1 rounded ${
              (card.raridade || card.rarity) === 'Mítico'
                ? 'bg-red-600'
                : (card.raridade || card.rarity) === 'Lendário'
                ? 'bg-yellow-600'
                : 'bg-purple-600'
            }`}
          >
            {(card.raridade || card.rarity)?.charAt(0)}
          </div>
        </div>
      )}

      {/* Overlay de tipo de carta */}
  {((card.tipo || card.type) !== 'creature') && (
        <div className="absolute bottom-1 left-1">
          <div className="text-xs bg-black/70 px-1 rounded">
    {(card.tipo || card.type) === 'spell' ? '✨' : '⚱️'}
          </div>
        </div>
      )}
    </div>
  );
}
