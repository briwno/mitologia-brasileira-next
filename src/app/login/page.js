// src/app/login/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import PageLayout from '../../components/UI/PageLayout';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = isLogin
        ? { action: 'login', username: formData.username, password: formData.password }
        : { action: 'register', username: formData.username, email: formData.email, password: formData.password };
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha na autenticação');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <PageLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 w-full max-w-md border border-green-500/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </h1>
          <p className="text-gray-300 mt-2">
            {isLogin ? 'Entre em sua conta' : 'Crie sua conta e comece a jogar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username em ambos os modos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome de usuário
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                required={!isLogin}
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
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                required={!isLogin}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-400 hover:text-green-300 text-sm"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
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
    </PageLayout>
  );
}
