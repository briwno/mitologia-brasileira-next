import React from 'react';

// Fundo do tabuleiro com imagem dinâmica
export default function FundoDoTabuleiro({ bgImage, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </div>
  );
}

