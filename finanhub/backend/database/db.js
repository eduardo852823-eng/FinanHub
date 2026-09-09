const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database', 'finanhub.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

function init() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  // Instituições suportadas inicialmente (sem integração real ainda)
  const instituicoes = [
    ['inter', 'Banco Inter', '#f97316'],
    ['bb', 'Banco do Brasil', '#eab308'],
    ['caixa', 'Caixa Econômica', '#0ea5e9'],
    ['nubank', 'Nubank', '#a855f7'],
    ['itau', 'Itaú', '#f97316'],
    ['bradesco', 'Bradesco', '#dc2626'],
    ['santander', 'Santander', '#dc2626'],
    ['brb', 'BRB', '#3b82f6'],
    ['c6', 'C6 Bank', '#1f2937'],
    ['btg', 'BTG Pactual', '#0f172a'],
    ['mercadopago', 'Mercado Pago', '#0ea5e9'],
    ['sicoob', 'Sicoob', '#16a34a'],
    ['sicredi', 'Sicredi', '#16a34a'],
  ];
  const insertInst = db.prepare('INSERT OR IGNORE INTO instituicoes (slug, nome, cor) VALUES (?, ?, ?)');
  instituicoes.forEach(i => insertInst.run(...i));

  // Categorias padrão do sistema (usuario_id nulo)
  const categorias = [
    ['Alimentação', '#f97316'],
    ['Transporte', '#3b82f6'],
    ['Entretenimento', '#a855f7'],
    ['Contas', '#eab308'],
    ['Compras', '#ef4444'],
    ['Saúde', '#22c55e'],
    ['Educação', '#0ea5e9'],
    ['Outros', '#9aa4bd'],
  ];
  const insertCat = db.prepare('INSERT OR IGNORE INTO categorias (usuario_id, nome, cor) SELECT NULL, ?, ? WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = ? AND usuario_id IS NULL)');
  categorias.forEach(([nome, cor]) => insertCat.run(nome, cor, nome));
}

module.exports = { db, init };
