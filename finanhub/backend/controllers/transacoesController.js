const { db } = require('../database/db');
const { categorizar, aprenderComCorrecao } = require('../services/categorizacao');

function listar(req, res) {
  const { banco, tipo, busca, mes, ano } = req.query;
  let sql = `
    SELECT t.*, i.slug AS instituicao_slug, i.nome AS instituicao_nome,
           c.nome AS categoria_nome, c.cor AS categoria_cor
    FROM transacoes t
    JOIN instituicoes i ON i.id = t.instituicao_id
    LEFT JOIN categorias c ON c.id = t.categoria_id
    WHERE t.usuario_id = ?
  `;
  const params = [req.usuario.id];

  if (banco) { sql += ' AND i.slug = ?'; params.push(banco); }
  if (tipo) { sql += ' AND t.tipo = ?'; params.push(tipo); }
  if (busca) { sql += ' AND LOWER(t.descricao) LIKE ?'; params.push(`%${busca.toLowerCase()}%`); }
  if (mes) { sql += " AND strftime('%m', t.data) = ?"; params.push(String(mes).padStart(2, '0')); }
  if (ano) { sql += " AND strftime('%Y', t.data) = ?"; params.push(String(ano)); }

  sql += ' ORDER BY t.data DESC';
  res.json(db.prepare(sql).all(...params));
}

function criar(req, res) {
  const { conta_id, instituicao_id, data, descricao, valor, tipo, categoria_id } = req.body;
  if (!conta_id || !instituicao_id || !data || !descricao || valor === undefined || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }

  const catFinal = categoria_id || categorizar(req.usuario.id, descricao);

  const info = db.prepare(`
    INSERT INTO transacoes (usuario_id, conta_id, instituicao_id, data, descricao, valor, tipo, categoria_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.usuario.id, conta_id, instituicao_id, data, descricao, valor, tipo, catFinal);

  res.status(201).json({ id: info.lastInsertRowid });
}

function atualizarCategoria(req, res) {
  const { id } = req.params;
  const { categoria_id } = req.body;

  const tx = db.prepare('SELECT * FROM transacoes WHERE id = ? AND usuario_id = ?').get(id, req.usuario.id);
  if (!tx) return res.status(404).json({ erro: 'Transação não encontrada.' });

  db.prepare('UPDATE transacoes SET categoria_id = ?, categoria_manual = 1 WHERE id = ?').run(categoria_id, id);
  aprenderComCorrecao(req.usuario.id, tx.descricao, categoria_id);

  res.json({ ok: true });
}

function excluir(req, res) {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM transacoes WHERE id = ? AND usuario_id = ?').run(id, req.usuario.id);
  if (info.changes === 0) return res.status(404).json({ erro: 'Transação não encontrada.' });
  res.json({ ok: true });
}

module.exports = { listar, criar, atualizarCategoria, excluir };
