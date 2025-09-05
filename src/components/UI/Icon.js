import React from 'react';
import Image from 'next/image';

/**
 * Componente Icon que utiliza ícones do Icons8
 * Substitui emojis mantendo estrutura e tamanho
 */
const Icon = ({ name, size = 24, className = '' }) => {
  // Mapeamento de nomes para URLs do Icons8
  const iconMap = {
    // Navegação
    'home': 'https://img.icons8.com/fluency/48/home.png',
    'battle': 'https://img.icons8.com/fluency/48/sword.png',
    'museum': 'https://img.icons8.com/fluency/48/museum.png',
    'profile': 'https://img.icons8.com/?size=100&id=YtnFdkYn0RsE&format=png&color=000000',
    'trophy': 'https://img.icons8.com/fluency/48/trophy.png',
    
    // Interface
    'settings': 'https://img.icons8.com/fluency/48/settings.png',
    'scroll': 'https://img.icons8.com/fluency/48/scroll.png',
    'leaf': 'https://img.icons8.com/fluency/48/leaf.png',
    'close': 'https://img.icons8.com/fluency/48/delete-sign.png',
    'x': 'https://img.icons8.com/fluency/48/delete-sign.png',
    'target': 'https://img.icons8.com/fluency/48/target.png',
    'lock': 'https://img.icons8.com/fluency/48/lock.png',
    'refresh': 'https://img.icons8.com/fluency/48/refresh.png',
    'next': 'https://img.icons8.com/fluency/48/fast-forward.png',
    'disabled': 'https://img.icons8.com/fluency/48/cancel.png',
    'clock': 'https://img.icons8.com/fluency/48/clock.png',
    'shield': 'https://img.icons8.com/fluency/48/shield.png',
    'heart': 'https://img.icons8.com/fluency/48/heart.png',
    
    // Jogo e cartas
    'cards': 'https://img.icons8.com/?size=100&id=ce72bFahG6vd&format=png&color=000000',
    'shop': 'https://img.icons8.com/fluency/48/shopping-cart.png',
    'magic': 'https://img.icons8.com/fluency/48/magic-wand.png',
    'star': 'https://img.icons8.com/fluency/48/star.png',
    'sparkles': 'https://img.icons8.com/fluency/48/sparkles.png',
    'fire': 'https://img.icons8.com/fluency/48/fire.png',
    'lightning': 'https://img.icons8.com/fluency/48/lightning-bolt.png',
    'dizzy': 'https://img.icons8.com/fluency/48/dizzy.png',
    
    // Elementos naturais
    'tree': 'https://img.icons8.com/fluency/48/tree.png',
    'wave': 'https://img.icons8.com/fluency/48/wave.png',
    'cactus': 'https://img.icons8.com/fluency/48/cactus.png',
    'crocodile': 'https://img.icons8.com/fluency/48/crocodile.png',
    'moon': 'https://img.icons8.com/fluency/48/moon-phase.png',
    'forest': 'https://img.icons8.com/fluency/48/forest.png',
    
    // Eventos e festivais
    'carnival': 'https://img.icons8.com/fluency/48/carnival-mask.png',
    'bonfire': 'https://img.icons8.com/fluency/48/bonfire.png',
    'corn': 'https://img.icons8.com/fluency/48/corn.png',
    'book': 'https://img.icons8.com/fluency/48/book.png',
    'gift': 'https://img.icons8.com/fluency/48/gift.png',
    'medal': 'https://img.icons8.com/fluency/48/medal.png',
    'calendar': 'https://img.icons8.com/fluency/48/calendar.png',
    
    // Redes sociais
    'twitter': 'https://img.icons8.com/fluency/48/twitter.png',
    'whatsapp': 'https://img.icons8.com/fluency/48/whatsapp.png',
    'instagram': 'https://img.icons8.com/fluency/48/instagram-new.png',
    'share': 'https://img.icons8.com/fluency/48/share.png',
    'link': 'https://img.icons8.com/fluency/48/link.png',
  };

  const iconUrl = iconMap[name];
  
  if (!iconUrl) {
    console.warn(`Ícone "${name}" não encontrado no mapeamento`);
    return <span className={className} style={{ fontSize: size }}>❓</span>;
  }

  return (
    <Image 
      src={iconUrl}
      alt={name}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default Icon;
