// src/app/loading.js
import LoadingSpinner from '@/components/UI/LoadingSpinner';

// Tela global de carregamento para transições do App Router
export default function CarregamentoRaiz() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <LoadingSpinner text="Carregando..." />
    </div>
  );
}
