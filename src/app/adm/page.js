'use client';

import { useMemo, useState } from 'react';
import AdminLayout from '@/components/Admin/AdminLayout';
import CrudSection from '@/components/Admin/CrudSection';
import { ADMIN_SECTIONS } from '@/components/Admin/adminSections';

const sectionSummaries = ADMIN_SECTIONS.map(({ id, label, groupLabel }) => ({
  id,
  label,
  groupLabel,
}));

const sectionMap = ADMIN_SECTIONS.reduce((acc, section) => {
  acc[section.id] = section;
  return acc;
}, {});

export default function AdminPage() {
  const [activeSectionId, setActiveSectionId] = useState(ADMIN_SECTIONS[0]?.id || null);

  const activeSection = useMemo(() => {
    if (!activeSectionId) return null;
    return sectionMap[activeSectionId] || null;
  }, [activeSectionId]);

  return (
    <AdminLayout
      sections={sectionSummaries}
      activeSection={activeSectionId}
      onSelectSection={setActiveSectionId}
      title="Ka'aguy • Painel Administrativo"
      description="Gerencie cartas, contos, jogadores e quizzes em uma interface única."
    >
      {activeSection ? (
        <CrudSection key={activeSection.id} config={activeSection} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-slate-400">
          <h2 className="text-xl font-semibold text-white">Selecione uma seção</h2>
          <p className="max-w-md text-sm">
            Escolha uma área no menu lateral para começar a gerenciar o conteúdo do jogo.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}

