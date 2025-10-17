// src/components/Profile/EditProfileModal.js
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ModalEditarPerfil({ 
  isOpen: estaAberto, 
  onClose: aoFechar, 
  player: jogador, 
  onUpdate: aoAtualizar 
}) {
  const [abaAtiva, definirAbaAtiva] = useState('avatar');
  const [carregando, definirCarregando] = useState(false);
  const [mensagem, definirMensagem] = useState(null);
  
  // Estados para edição
  const [novoNickname, definirNovoNickname] = useState('');
  const [tituloSelecionado, definirTituloSelecionado] = useState(null);
  const [titulos, definirTitulos] = useState([]);
  const [titulosDesbloqueados, definirTitulosDesbloqueados] = useState([]);
  const [previewAvatar, definirPreviewAvatar] = useState(null);
  const [avatarFile, definirAvatarFile] = useState(null);
  
  const inputFileRef = useRef(null);

  const carregarTitulos = async () => {
    try {
      const resposta = await fetch(`/api/profile?playerId=${jogador.id}`);
      const dados = await resposta.json();
      
      if (resposta.ok) {
        definirTitulos(dados.titulos || []);
        definirTitulosDesbloqueados(dados.titulosDesbloqueados || []);
      }
    } catch (erro) {
      console.error('Erro ao carregar títulos:', erro);
    }
  };

  useEffect(() => {
    if (estaAberto && jogador) {
      definirNovoNickname(jogador.nickname || jogador.name || '');
      definirTituloSelecionado(jogador.titulo_selecionado || null);
      carregarTitulos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAberto, jogador]);

  const aoSelecionarAvatar = (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    // Validar tipo
    if (!arquivo.type.startsWith('image/')) {
      definirMensagem({ tipo: 'erro', texto: 'Apenas imagens são permitidas' });
      return;
    }

    // Validar tamanho (max 2MB)
    if (arquivo.size > 2 * 1024 * 1024) {
      definirMensagem({ tipo: 'erro', texto: 'Imagem muito grande. Máximo 2MB.' });
      return;
    }

    // Criar preview
    const leitor = new FileReader();
    leitor.onloadend = () => {
      definirPreviewAvatar(leitor.result);
      definirAvatarFile(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  };

  const aoSalvarAvatar = async () => {
    if (!avatarFile) {
      definirMensagem({ tipo: 'erro', texto: 'Selecione uma imagem primeiro' });
      return;
    }

    definirCarregando(true);
    definirMensagem(null);

    try {
      const resposta = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: jogador.id,
          acao: 'upload_avatar',
          avatar: avatarFile,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        definirMensagem({ tipo: 'sucesso', texto: 'Avatar atualizado com sucesso!' });
        aoAtualizar(dados.player);
        setTimeout(() => {
          aoFechar();
          definirPreviewAvatar(null);
          definirAvatarFile(null);
        }, 1500);
      } else {
        definirMensagem({ tipo: 'erro', texto: dados.error || 'Erro ao atualizar avatar' });
      }
    } catch (erro) {
      console.error('Erro ao atualizar avatar:', erro);
      definirMensagem({ tipo: 'erro', texto: 'Erro ao atualizar avatar' });
    } finally {
      definirCarregando(false);
    }
  };

  const aoSalvarNickname = async () => {
    if (!novoNickname || novoNickname.trim().length < 3) {
      definirMensagem({ tipo: 'erro', texto: 'Nickname deve ter pelo menos 3 caracteres' });
      return;
    }

    if (novoNickname.length > 20) {
      definirMensagem({ tipo: 'erro', texto: 'Nickname deve ter no máximo 20 caracteres' });
      return;
    }

    definirCarregando(true);
    definirMensagem(null);

    try {
      const resposta = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: jogador.id,
          acao: 'atualizar_nickname',
          nickname: novoNickname,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        definirMensagem({ tipo: 'sucesso', texto: 'Nickname atualizado com sucesso!' });
        aoAtualizar(dados.player);
        setTimeout(() => {
          aoFechar();
        }, 1500);
      } else {
        definirMensagem({ tipo: 'erro', texto: dados.error || 'Erro ao atualizar nickname' });
      }
    } catch (erro) {
      console.error('Erro ao atualizar nickname:', erro);
      definirMensagem({ tipo: 'erro', texto: 'Erro ao atualizar nickname' });
    } finally {
      definirCarregando(false);
    }
  };

  const aoSelecionarTitulo = async (tituloId) => {
    definirCarregando(true);
    definirMensagem(null);

    try {
      const resposta = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: jogador.id,
          acao: 'atualizar_titulo',
          tituloId: tituloId,
        }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        definirTituloSelecionado(tituloId);
        definirMensagem({ tipo: 'sucesso', texto: 'Título atualizado com sucesso!' });
        aoAtualizar(dados.player);
      } else {
        definirMensagem({ tipo: 'erro', texto: dados.error || 'Erro ao atualizar título' });
      }
    } catch (erro) {
      console.error('Erro ao atualizar título:', erro);
      definirMensagem({ tipo: 'erro', texto: 'Erro ao atualizar título' });
    } finally {
      definirCarregando(false);
    }
  };

  const obterCorRaridade = (raridade) => {
    const cores = {
      comum: 'text-gray-400 border-gray-600',
      incomum: 'text-green-400 border-green-600',
      rara: 'text-blue-400 border-blue-600',
      epica: 'text-purple-400 border-purple-600',
      lendaria: 'text-orange-400 border-orange-600',
      mitica: 'text-red-400 border-red-600',
    };
    return cores[raridade] || cores.comum;
  };

  if (!estaAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-purple-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 border-b-2 border-purple-400">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">✏️ Editar Perfil</h2>
            <button
              onClick={aoFechar}
              className="text-white hover:text-red-400 text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-500/20 border border-green-500 text-green-400' 
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => definirAbaAtiva('avatar')}
            className={`flex-1 p-4 font-semibold transition-colors ${
              abaAtiva === 'avatar'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            📷 Avatar
          </button>
          <button
            onClick={() => definirAbaAtiva('nickname')}
            className={`flex-1 p-4 font-semibold transition-colors ${
              abaAtiva === 'nickname'
                ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            ✏️ Nickname
          </button>
          <button
            onClick={() => definirAbaAtiva('titulo')}
            className={`flex-1 p-4 font-semibold transition-colors ${
              abaAtiva === 'titulo'
                ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            👑 Título
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Aba Avatar */}
          {abaAtiva === 'avatar' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Escolha sua Foto de Perfil</h3>
                
                {/* Preview do avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                      {previewAvatar || jogador?.avatar_url ? (
                        <Image
                          src={previewAvatar || jogador.avatar_url}
                          alt="Preview"
                          width={156}
                          height={156}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-6xl">
                          {jogador?.name?.charAt(0)?.toUpperCase() || 'J'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  onChange={aoSelecionarAvatar}
                  className="hidden"
                />

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => inputFileRef.current?.click()}
                    disabled={carregando}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
                  >
                    📁 Escolher Imagem
                  </button>
                  
                  {avatarFile && (
                    <button
                      onClick={aoSalvarAvatar}
                      disabled={carregando}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
                    >
                      {carregando ? '⏳ Salvando...' : '💾 Salvar Avatar'}
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  Formatos aceitos: JPG, PNG, GIF • Tamanho máximo: 2MB
                </p>
              </div>
            </div>
          )}

          {/* Aba Nickname */}
          {abaAtiva === 'nickname' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-green-400">Escolha seu Nickname</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nickname Atual: <span className="text-yellow-400">{jogador?.nickname || jogador?.name}</span>
                  </label>
                  <input
                    type="text"
                    value={novoNickname}
                    onChange={(e) => definirNovoNickname(e.target.value)}
                    maxLength={20}
                    placeholder="Digite seu novo nickname"
                    className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      Mínimo 3 caracteres, máximo 20
                    </p>
                    <p className="text-xs text-gray-400">
                      {novoNickname.length}/20
                    </p>
                  </div>
                </div>

                <button
                  onClick={aoSalvarNickname}
                  disabled={carregando || novoNickname.length < 3}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors font-semibold"
                >
                  {carregando ? '⏳ Salvando...' : '💾 Salvar Nickname'}
                </button>
              </div>
            </div>
          )}

          {/* Aba Título */}
          {abaAtiva === 'titulo' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-yellow-400">Escolha seu Título</h3>
                
                {/* Título atual */}
                <div className="mb-6 p-4 bg-black/40 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-gray-400 mb-2">Título Atual:</p>
                  {tituloSelecionado ? (
                    <p className="text-lg font-bold text-yellow-400">
                      {titulos.find(t => t.id === tituloSelecionado)?.icone} {titulos.find(t => t.id === tituloSelecionado)?.nome}
                    </p>
                  ) : (
                    <p className="text-lg text-gray-500 italic">Nenhum título selecionado</p>
                  )}
                </div>

                {/* Lista de títulos */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Opção de remover título */}
                  <button
                    onClick={() => aoSelecionarTitulo(null)}
                    disabled={carregando}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      tituloSelecionado === null
                        ? 'bg-gray-700 border-gray-400'
                        : 'bg-black/40 border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-bold text-gray-400">🚫 Sem título</p>
                        <p className="text-xs text-gray-500">Remover título exibido</p>
                      </div>
                      {tituloSelecionado === null && (
                        <span className="text-green-400 font-bold">✓ Selecionado</span>
                      )}
                    </div>
                  </button>

                  {titulos.map((titulo) => {
                    const desbloqueado = titulosDesbloqueados.includes(titulo.id);
                    const selecionado = tituloSelecionado === titulo.id;
                    const corRaridade = obterCorRaridade(titulo.raridade);

                    return (
                      <button
                        key={titulo.id}
                        onClick={() => desbloqueado && aoSelecionarTitulo(titulo.id)}
                        disabled={carregando || !desbloqueado}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          !desbloqueado
                            ? 'bg-black/20 border-gray-800 opacity-50 cursor-not-allowed'
                            : selecionado
                            ? `bg-yellow-500/20 border-yellow-400`
                            : `bg-black/40 ${corRaridade} hover:scale-[1.02]`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className={`font-bold ${desbloqueado ? corRaridade.split(' ')[0] : 'text-gray-600'}`}>
                              {titulo.icone} {titulo.nome}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{titulo.descricao}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {desbloqueado ? `✓ Desbloqueado` : `🔒 ${titulo.condicao_desbloqueio}`}
                            </p>
                          </div>
                          {selecionado && (
                            <span className="text-green-400 font-bold">✓ Equipado</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={aoFechar}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
