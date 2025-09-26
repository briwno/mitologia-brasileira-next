'use client';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminLayout({
  title = 'Painel Administrativo',
  description = 'Gerencie todo o conteúdo do Ka\'aguy de forma centralizada.',
  sections = [],
  activeSection,
  onSelectSection,
  actions,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-1 flex-col px-6 py-6 lg:flex-row lg:gap-6">
        <aside className="mb-6 w-full lg:mb-0 lg:w-60">
          <nav className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Seções
            </p>
            <ul className="space-y-1">
              {sections.map((section) => {
                const isActive = section.id === activeSection;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSection?.(section.id)}
                      className={cn(
                        'w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/60'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      )}
                    >
                      <span className="block text-xs uppercase tracking-wide text-slate-500">
                        {section.groupLabel || 'Conteúdo'}
                      </span>
                      <span>{section.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl shadow-emerald-500/5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

