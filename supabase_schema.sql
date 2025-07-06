-- ArcoTrack v4.0 - Schema do Banco de Dados Supabase
-- Execute este SQL no editor SQL do Supabase

-- Habilitar RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Tabela de perfis de usuários (extende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tabela de treinos
CREATE TABLE IF NOT EXISTS public.treinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  series INTEGER NOT NULL,
  flechas_por_serie INTEGER NOT NULL,
  distancia INTEGER NOT NULL,
  tem_objetivo BOOLEAN DEFAULT false,
  objetivo INTEGER,
  pontuacao_total INTEGER DEFAULT 0,
  melhor_serie INTEGER DEFAULT 0,
  observacoes TEXT,
  concluido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para treinos
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own treinos" ON public.treinos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treinos" ON public.treinos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treinos" ON public.treinos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own treinos" ON public.treinos
  FOR DELETE USING (auth.uid() = user_id);

-- Tabela de séries
CREATE TABLE IF NOT EXISTS public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treino_id UUID REFERENCES public.treinos(id) ON DELETE CASCADE NOT NULL,
  numero_serie INTEGER NOT NULL,
  pontuacao INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para series
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own series" ON public.series
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = series.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own series" ON public.series
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = series.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own series" ON public.series
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = series.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own series" ON public.series
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = series.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

-- Tabela de flechas
CREATE TABLE IF NOT EXISTS public.flechas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serie_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  valor INTEGER NOT NULL,
  x FLOAT,
  y FLOAT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para flechas
ALTER TABLE public.flechas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flechas" ON public.flechas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.series 
      JOIN public.treinos ON treinos.id = series.treino_id
      WHERE series.id = flechas.serie_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own flechas" ON public.flechas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.series 
      JOIN public.treinos ON treinos.id = series.treino_id
      WHERE series.id = flechas.serie_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own flechas" ON public.flechas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.series 
      JOIN public.treinos ON treinos.id = series.treino_id
      WHERE series.id = flechas.serie_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own flechas" ON public.flechas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.series 
      JOIN public.treinos ON treinos.id = series.treino_id
      WHERE series.id = flechas.serie_id 
      AND treinos.user_id = auth.uid()
    )
  );

-- Tabela de autoavaliações
CREATE TABLE IF NOT EXISTS public.autoavaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  treino_id UUID REFERENCES public.treinos(id) ON DELETE CASCADE NOT NULL,
  postura INTEGER DEFAULT 5 CHECK (postura >= 0 AND postura <= 10),
  ancoragem INTEGER DEFAULT 5 CHECK (ancoragem >= 0 AND ancoragem <= 10),
  alinhamento INTEGER DEFAULT 5 CHECK (alinhamento >= 0 AND alinhamento <= 10),
  respiracao INTEGER DEFAULT 5 CHECK (respiracao >= 0 AND respiracao <= 10),
  mira INTEGER DEFAULT 5 CHECK (mira >= 0 AND mira <= 10),
  liberacao INTEGER DEFAULT 5 CHECK (liberacao >= 0 AND liberacao <= 10),
  follow_through INTEGER DEFAULT 5 CHECK (follow_through >= 0 AND follow_through <= 10),
  consistencia INTEGER DEFAULT 5 CHECK (consistencia >= 0 AND consistencia <= 10),
  ritmo INTEGER DEFAULT 5 CHECK (ritmo >= 0 AND ritmo <= 10),
  foco INTEGER DEFAULT 5 CHECK (foco >= 0 AND foco <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para autoavaliacoes
ALTER TABLE public.autoavaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own autoavaliacoes" ON public.autoavaliacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = autoavaliacoes.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own autoavaliacoes" ON public.autoavaliacoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = autoavaliacoes.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own autoavaliacoes" ON public.autoavaliacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = autoavaliacoes.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own autoavaliacoes" ON public.autoavaliacoes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.treinos 
      WHERE treinos.id = autoavaliacoes.treino_id 
      AND treinos.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_treinos_user_id ON public.treinos(user_id);
CREATE INDEX IF NOT EXISTS idx_treinos_data ON public.treinos(data);
CREATE INDEX IF NOT EXISTS idx_series_treino_id ON public.series(treino_id);
CREATE INDEX IF NOT EXISTS idx_flechas_serie_id ON public.flechas(serie_id);
CREATE INDEX IF NOT EXISTS idx_autoavaliacoes_treino_id ON public.autoavaliacoes(treino_id);

-- Comentários nas tabelas
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários do ArcoTrack';
COMMENT ON TABLE public.treinos IS 'Registros de treinos de tiro com arco';
COMMENT ON TABLE public.series IS 'Séries individuais dentro de um treino';
COMMENT ON TABLE public.flechas IS 'Flechas individuais com coordenadas precisas';
COMMENT ON TABLE public.autoavaliacoes IS 'Autoavaliações do processo de tiro (0-10)';
