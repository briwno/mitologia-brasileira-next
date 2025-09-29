// src/app/pvp/page.js
"use client";

import { useRouter } from 'next/navigation';
import LayoutDePagina from '@/components/UI/PageLayout';
import ModalPvP from '@/components/PvP/PvPModal';

export default function LobbyPvP() {
  const navegador = useRouter();

  const aoFecharModal = () => {
    navegador.push('/');
  };

  return (
    <LayoutDePagina>
      {/* Modal PvP abre automaticamente */}
      <ModalPvP onClose={aoFecharModal} />
    </LayoutDePagina>
  );
}
