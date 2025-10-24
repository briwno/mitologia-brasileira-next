"use client";

import Icon from '@/components/UI/Icon';
import { patchNotes, proximasAtualizacoes, notaDesenvolvedor, VERSAO_ATUAL } from '@/data/patchNotes';

export default function PatchNotesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const getCoresSecao = (cor) => {
    const cores = {
      red: 'text-red-400',
      purple: 'text-purple-400',
      blue: 'text-blue-400',
      green: 'text-green-400'
    };
    return cores[cor] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gradient-to-br from-[#101c2a] to-[#0a1420] rounded-xl shadow-2xl p-8 min-w-[340px] max-w-[800px] max-h-[85vh] w-[90vw] relative overflow-hidden border border-cyan-500/20" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="absolute top-4 right-4 text-white text-2xl hover:text-cyan-300 transition-colors z-10"
          onClick={onClose}
          title="Fechar"
        >
          ×
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Icon name="notes" size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Patch Notes</h2>
            <p className="text-sm text-cyan-300">Atualizações e melhorias do jogo</p>
          </div>
        </div>
        
        <div className="text-sm text-white/90 space-y-6 overflow-y-auto pr-3" style={{ maxHeight: '65vh' }}>
          {/* Renderizar todas as versões */}
          {patchNotes.map((versao, index) => (
            <section 
              key={versao.versao}
              className={
                versao.atual 
                  ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-5 border border-cyan-500/30'
                  : 'bg-black/30 rounded-lg p-5 border border-white/10'
              }
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-bold ${versao.atual ? 'text-cyan-300' : 'text-white'}`}>
                  v{versao.versao} - {versao.titulo}
                </h3>
                {versao.atual && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-bold">
                    ATUAL
                  </span>
                )}
                {!versao.atual && (
                  <span className="text-xs text-gray-400">{versao.data}</span>
                )}
              </div>
              {versao.atual && (
                <p className="text-xs text-cyan-200/60 mb-4">{versao.data}</p>
              )}
              
              <div className={versao.atual ? 'space-y-4' : 'space-y-3'}>
                {versao.secoes.map((secao, secaoIndex) => (
                  <div key={secaoIndex}>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <span className={getCoresSecao(secao.cor)}>{secao.icone}</span> {secao.titulo}
                    </h4>
                    <ul className={`space-y-1 ${versao.atual ? 'text-white/80' : 'text-white/70 text-sm'}`}>
                      {secao.itens.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className={`${getCoresSecao(secao.cor)} mt-0.5`}>•</span>
                          <span>
                            {item.destaque && <strong>{item.destaque}</strong>} {item.descricao}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Roadmap Futuro */}
          <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-lg font-bold text-purple-300">Próximas Atualizações</h3>
            </div>
            
            <ul className="space-y-2 text-white/70 text-sm">
              {proximasAtualizacoes.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  <span>
                    <strong className="text-white">{item.titulo}</strong> {item.descricao}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Nota de Desenvolvimento */}
          <section className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-1">{notaDesenvolvedor.titulo}</h4>
                <p className="text-sm text-yellow-100/80">
                  {notaDesenvolvedor.mensagem}
                </p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Versão atual: <span className="text-cyan-400 font-bold">{VERSAO_ATUAL}</span>
          </div>
          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
