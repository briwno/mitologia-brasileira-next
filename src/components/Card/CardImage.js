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
  preferFull = false,
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

  // Escolha da melhor fonte de imagem
  const fullSrc = card.imagens?.completa || card.images?.full;
  const portraitSrc = card.imagens?.retrato || card.images?.portrait;
  const chosenSrc = (!erroNaImagem && (preferFull && fullSrc ? fullSrc : portraitSrc)) || null;

  // Sizes responsivos por tamanho (evitar subentrega e upscaling)
  const sizesStr = size === 'small'
    ? '(max-width:640px) 80px, 120px'
    : size === 'medium'
      ? '(max-width:640px) 160px, (max-width:1024px) 200px, 240px'
      : size === 'large'
        ? '(max-width:640px) 220px, (max-width:1024px) 320px, 380px'
        : '(max-width:768px) 90vw, (max-width:1280px) 60vw, 900px';

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
      {chosenSrc ? (
        <Image
          src={chosenSrc}
          alt={card.nome || card.name}
          fill
          className="object-cover"
          sizes={sizesStr}
          quality={95}
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
  {(() => {
    const t = (card.tipo || card.type || '').toString().toLowerCase();
    if (!t || t === 'creature') return null;
    return (
        <div className="absolute bottom-1 left-1">
          <div className="text-xs bg-black/70 px-1 rounded">
  {t === 'spell' ? '✨' : '⚱️'}
          </div>
        </div>
    );
    })()}
    </div>
  );
}
