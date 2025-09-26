// src/app/museum/page.js
"use client";

import { useRouter } from 'next/navigation';
import LayoutDePagina from '../../components/UI/PageLayout';
import ModalMuseu from '@/components/Museum/MuseumModal';

export default function LobbyMuseu() {
  const navegador = useRouter();

  const aoFecharModal = () => {
    navegador.push('/');
  };

  return (
    <LayoutDePagina>
      {/* Modal Museu abre automaticamente */}
  <ModalMuseu onClose={aoFecharModal} />
    </LayoutDePagina>
  );
}