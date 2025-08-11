import React from 'react';

export default function BoardBackground({ bgImage, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.8s cubic-bezier(0.4,0,0.2,1)'
      }}
    >
      {children}
    </div>
  );
}

