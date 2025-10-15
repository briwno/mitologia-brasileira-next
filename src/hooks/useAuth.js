// src/hooks/useAuth.js
"use client";

import { useCallback, useEffect, useMemo, useState, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

const DEFAULT_AVATAR = 'https://img.icons8.com/emoji/96/man-technologist.png';

function buildUserPayload(authUser, player) {
  if (!authUser && !player) {
    return null;
  }

  const resolvedId = authUser?.id || player?.id || null;
  const nickname = (player?.nickname || authUser?.user_metadata?.nickname || authUser?.email?.split('@')[0] || 'Jogador').trim();

  return {
    id: resolvedId,
    email: authUser?.email || null,
    nickname,
    name: nickname,
    avatar_url: player?.avatar_url || authUser?.user_metadata?.avatar_url || DEFAULT_AVATAR,
    level: player?.level ?? 1,
    xp: player?.xp ?? 0,
    mmr: player?.mmr ?? 1000,
    coins: player?.coins ?? 0,
    title: player?.title || 'Aspirante',
    banned: player?.banned ?? false,
    created_at: player?.created_at || null,
    updated_at: player?.updated_at || null,
    rawAuthUser: authUser || null,
    rawPlayer: player || null,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  const loadProfile = useCallback(async (currentSession, ensureProfile = true) => {
    if (!currentSession?.user) return null;
    
    if (!supabase) {
      throw new Error('Supabase não configurado. Verifique suas variáveis de ambiente.');
    }

    const authUser = currentSession.user;

    // Buscar perfil via API (que usa supabaseAdmin e bypassa RLS)
    try {
      const response = await fetch(`/api/players?id=${authUser.id}`);
      
      let playerRecord = null;
      
      if (response.ok) {
        const data = await response.json();
        playerRecord = data.player || null;
      } else if (response.status === 404) {
        // Perfil não encontrado
        playerRecord = null;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Auth] Erro ao carregar perfil do jogador:', errorData);
        throw new Error('Falha ao carregar dados do jogador.');
      }

      // Se não encontrou o perfil e deve provisionar
      if (!playerRecord && ensureProfile && currentSession?.access_token) {
        try {
          const createResponse = await fetch('/api/players', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentSession.access_token}`,
            },
            body: JSON.stringify({
              id: authUser.id,
              nickname: authUser.user_metadata?.nickname || authUser.email?.split('@')[0],
              avatar_url: authUser.user_metadata?.avatar_url,
            }),
          });

          if (createResponse.ok) {
            const body = await createResponse.json();
            playerRecord = body.player || null;
          } else if (createResponse.status !== 409) {
            const body = await createResponse.json().catch(() => ({}));
            console.warn('[Auth] Provisionamento do perfil retornou erro:', body.error || createResponse.statusText);
          }
        } catch (provisionError) {
          console.warn('[Auth] Não foi possível provisionar o perfil do jogador:', provisionError);
        }
      }

      return buildUserPayload(authUser, playerRecord);
    } catch (error) {
      console.error('[Auth] Erro ao carregar perfil:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialiseSession() {
      if (!supabase) {
        console.error('[Auth] Supabase não está configurado.');
        if (active) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const currentSession = data.session ?? null;

        if (!active) return;

        setSession(currentSession);

        if (currentSession?.user) {
          try {
            const profile = await loadProfile(currentSession);
            if (active) {
              setUser(profile);
            }
          } catch (profileError) {
            console.error('[Auth] Erro ao inicializar perfil do jogador:', profileError);
            if (active) {
              setUser(buildUserPayload(currentSession.user, null));
              setLastError(profileError.message);
            }
          }
        } else if (active) {
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] Erro ao recuperar sessão:', err);
        if (active) {
          setSession(null);
          setUser(null);
          setLastError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialiseSession();

    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!active) return;

        setSession(newSession);

        if (newSession?.user) {
          setLoading(true);
          try {
            const profile = await loadProfile(newSession);
            if (active) {
              setUser(profile);
              setLastError(null);
            }
          } catch (profileError) {
            console.error('[Auth] Erro ao atualizar perfil após mudança de sessão:', profileError);
            if (active) {
              setUser(buildUserPayload(newSession.user, null));
              setLastError(profileError.message);
            }
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => {
        active = false;
        listener?.subscription?.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, [loadProfile]);

  const login = useCallback(async ({ email, password }) => {
    if (!supabase) {
      return { success: false, error: 'Supabase não configurado.' };
    }

    try {
      setLoading(true);
      setLastError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      const currentSession = data.session ?? (await supabase.auth.getSession()).data.session;

      setSession(currentSession ?? null);

      if (currentSession?.user) {
        const profile = await loadProfile(currentSession);
        setUser(profile);
        setLoading(false);
        return { success: true, user: profile };
      }

      setUser(null);
      setLoading(false);
      return { success: true, user: null };
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      setLastError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, [loadProfile]);

  const register = useCallback(async ({ email, password, nickname }) => {
    if (!supabase) {
      return { success: false, error: 'Supabase não configurado.' };
    }

    try {
      setLoading(true);
      setLastError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
      });

      if (error) {
        throw error;
      }

      const currentSession = data.session ?? (await supabase.auth.getSession()).data.session;

      setSession(currentSession ?? null);

      if (currentSession?.user) {
        const profile = await loadProfile(currentSession);
        setUser(profile);
      } else {
        setUser(null);
      }

      setLoading(false);

      return {
        success: true,
        requiresEmailConfirmation: !currentSession,
      };
    } catch (error) {
      console.error('[Auth] Erro ao registrar usuário:', error);
      setLastError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { success: true };
    }

    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return { success: true };
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...userData };
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!session?.user) {
      return { success: false, error: 'Não autenticado.' };
    }

    try {
      const profile = await loadProfile(session, false);
      setUser(profile);
      setLastError(null);
      return { success: true, user: profile };
    } catch (error) {
      console.error('[Auth] Erro ao atualizar usuário:', error);
      setLastError(error.message);
      return { success: false, error: error.message };
    }
  }, [loadProfile, session]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    error: lastError,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: () => Boolean(session?.user?.id),
  }), [user, session, loading, lastError, login, register, logout, updateUser, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
