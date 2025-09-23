-- Adicionar permissões para a tabela quizzes
-- Este script deve ser executado no Supabase SQL Editor

-- Remover RLS (Row Level Security) para acesso administrativo
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;

-- Garantir que o usuário service_role (admin) tenha todas as permissões
GRANT ALL ON public.quizzes TO service_role;

-- Garantir que authenticated users possam ler quizzes (para o frontend)
GRANT SELECT ON public.quizzes TO authenticated;

-- Garantir que anon users possam ler quizzes (para acessos não autenticados)
GRANT SELECT ON public.quizzes TO anon;

-- Garantir acesso à sequência para inserções
GRANT USAGE, SELECT ON SEQUENCE public.quizzes_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.quizzes_id_seq TO authenticated;