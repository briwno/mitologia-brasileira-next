// src/components/PvP/BattleLog.jsx
"use client";

import { useEffect, useRef } from 'react';

/**
 * Componente de Log de Eventos da Batalha
 * Exibe histórico de ações com auto-scroll
 */
export default function BattleLog({ logs = [] }) {
  const logEndRef = useRef(null);

  // Auto-scroll para o final quando novos logs chegam
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-64 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-sm">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <span className="text-lg">📜</span>
        <span className="font-bold text-cyan-300">Log de Eventos</span>
      </div>

      {/* Lista de logs */}
      <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="text-neutral-400 text-center py-4">
            Aguardando início da batalha...
          </div>
        ) : (
          logs.map((log, i) => (
            <LogEntry key={i} log={log} />
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

/**
 * Componente individual de entrada do log
 */
function LogEntry({ log }) {
  const getLogColor = (type) => {
    switch (type) {
      case 'damage':
        return 'text-red-400';
      case 'heal':
        return 'text-green-400';
      case 'usar_ultimate':
        return 'text-purple-400';
      case 'defeat':
        return 'text-red-600 font-bold';
      case 'usar_skill':
        return 'text-yellow-400';
      case 'usar_item':
        return 'text-blue-400';
      case 'trocar_lenda':
        return 'text-cyan-400';
      default:
        return 'text-neutral-200';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'damage':
        return '💥';
      case 'heal':
        return '💚';
      case 'usar_ultimate':
        return '⚡';
      case 'defeat':
        return '💀';
      case 'usar_skill':
        return '✨';
      case 'usar_item':
        return '🎒';
      case 'trocar_lenda':
        return '🔄';
      default:
        return '•';
    }
  };

  return (
    <div className="bg-black/30 rounded p-2 space-y-1 hover:bg-black/50 transition-colors">
      {/* Timestamp */}
      <div className="text-xs text-cyan-400 font-mono">
        {log.timestamp || new Date().toLocaleTimeString('pt-BR')}
      </div>

      {/* Mensagem */}
      <div className={`text-xs ${getLogColor(log.type)}`}>
        <span className="mr-1">{getLogIcon(log.type)}</span>
        {log.formatted || log.text || 'Ação desconhecida'}
      </div>

      {/* Info adicional */}
      {log.data && log.data.damage && (
        <div className="text-xs text-red-300 font-semibold">
          -{log.data.damage} HP
          {log.data.isCritical && <span className="ml-1 text-yellow-400">CRÍTICO!</span>}
        </div>
      )}

      {log.data && log.data.healing && (
        <div className="text-xs text-green-300 font-semibold">
          +{log.data.healing} HP
        </div>
      )}
    </div>
  );
}
