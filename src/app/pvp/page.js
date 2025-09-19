// src/app/pvp/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutDePagina from '../../components/UI/PageLayout';
import PvPModal from '@/components/PvP/PvPModal';

export default function LobbyPvP() {
  const router = useRouter();

  const handleCloseModal = () => {
    router.push('/'); // Voltar para a página inicial quando fechar o modal
  };

  return (
    <LayoutDePagina>
      {/* Modal PvP abre automaticamente */}
      <PvPModal onClose={handleCloseModal} />
    </LayoutDePagina>
  );
}
