// src/app/museum/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutDePagina from '../../components/UI/PageLayout';
import MuseumModal from '@/components/Museum/MuseumModal';

export default function LobbyMuseum() {
  const router = useRouter();

  const handleCloseModal = () => {
    router.push('/'); // Voltar para a página inicial quando fechar o modal
  };

  return (
    <LayoutDePagina>
      {/* Modal Museu abre automaticamente */}
      <MuseumModal onClose={handleCloseModal} />
    </LayoutDePagina>
  );
}