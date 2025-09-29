// src/app/login/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import LayoutDePagina from '@/components/UI/PageLayout';

export default function PaginaLogin() {
  const [modoLogin, definirModoLogin] = useState(true);
  const [dadosFormulario, definirDadosFormulario] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [carregando, definirCarregando] = useState(false);

  const aoEnviarFormulario = async (evento) => {
    evento.preventDefault();
    if (!modoLogin && dadosFormulario.password !== dadosFormulario.confirmPassword) {
      alert('As senhas não conferem.');
      return;
    }
    try {
  definirCarregando(true);
      const carga = modoLogin
        ? { action: 'login', username: dadosFormulario.username, password: dadosFormulario.password }
        : { action: 'register', username: dadosFormulario.username, email: dadosFormulario.email, password: dadosFormulario.password };
      const resposta = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(carga) });
      const dadosResposta = await resposta.json();
      if (!resposta.ok) throw new Error(dadosResposta.error || 'Falha na autenticação');
      localStorage.setItem('authToken', dadosResposta.token);
      localStorage.setItem('user', JSON.stringify(dadosResposta.user));
      window.location.href = '/';
    } catch (erro) {
      alert(erro.message);
    } finally {
      definirCarregando(false);
    }
  };

  const aoAtualizarCampo = (evento) => {
    definirDadosFormulario({
      ...dadosFormulario,
      [evento.target.name]: evento.target.value
    });
  };

  return (
  <LayoutDePagina>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-md border border-green-500/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {modoLogin ? 'Entrar' : 'Cadastrar'}
          </h1>
          <p className="text-gray-300 mt-2">
            {modoLogin ? 'Entre em sua conta' : 'Crie sua conta e comece a jogar'}
          </p>
        </div>

  <form onSubmit={aoEnviarFormulario} className="space-y-4" aria-busy={carregando}>
          {/* Campo de nome de usuário presente em ambos os modos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome de usuário
            </label>
            <input
              type="text"
              name="username"
              value={dadosFormulario.username}
              onChange={aoAtualizarCampo}
      className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none disabled:opacity-60"
      disabled={carregando}
              required
            />
          </div>

          {!modoLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={dadosFormulario.email}
                onChange={aoAtualizarCampo}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none disabled:opacity-60"
                disabled={carregando}
                required={!modoLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={dadosFormulario.password}
              onChange={aoAtualizarCampo}
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none disabled:opacity-60"
              disabled={carregando}
              required
            />
          </div>

          {!modoLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={dadosFormulario.confirmPassword}
                onChange={aoAtualizarCampo}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none disabled:opacity-60"
                disabled={carregando}
                required={!modoLogin}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={carregando}
          >
            {carregando && (
              <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            )}
            {carregando ? (modoLogin ? 'Entrando...' : 'Cadastrando...') : (modoLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => definirModoLogin(!modoLogin)}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            {modoLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            ← Voltar ao início
          </Link>
        </div>
        </div>
      </div>
  </LayoutDePagina>
  );
}
