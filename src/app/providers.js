// src/app/providers.js
"use client";

import { AuthProvider as ProvedorAutenticacao } from '@/hooks/useAuth';

export default function Provedores({ children }) {
  return <ProvedorAutenticacao>{children}</ProvedorAutenticacao>;
}
