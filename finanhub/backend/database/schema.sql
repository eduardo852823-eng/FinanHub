-- FinanHub — schema inicial (SQLite)
-- Preparado para futura migração a PostgreSQL.

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT,               -- nulo quando login é via Google
  google_id TEXT UNIQUE,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instituicoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,      -- ex: 'inter', 'nubank'
  nome TEXT NOT NULL,
  cor TEXT
);

CREATE TABLE IF NOT EXISTS contas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id),
  apelido TEXT,
  saldo REAL DEFAULT 0,
  conectado INTEGER DEFAULT 0,     -- 0/1
  criada_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER REFERENCES usuarios(id), -- nulo = categoria padrão do sistema
  nome TEXT NOT NULL,
  cor TEXT,
  icone TEXT
);

CREATE TABLE IF NOT EXISTS regras_categorizacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER REFERENCES usuarios(id), -- nulo = regra padrão do sistema
  padrao TEXT NOT NULL,            -- trecho/expressão a buscar na descrição
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  criada_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  conta_id INTEGER NOT NULL REFERENCES contas(id),
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id),
  data TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  tipo TEXT CHECK(tipo IN ('entrada','saida')) NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id),
  categoria_manual INTEGER DEFAULT 0,
  criada_em TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Consentimentos de Open Finance (LGPD) — nenhuma senha bancária é armazenada aqui.
CREATE TABLE IF NOT EXISTS consentimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id),
  status TEXT CHECK(status IN ('pendente','ativo','revogado','expirado')) DEFAULT 'pendente',
  escopo TEXT,                     -- escopos concedidos (ex: 'contas,transacoes')
  concedido_em TEXT,
  expira_em TEXT
);

CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
