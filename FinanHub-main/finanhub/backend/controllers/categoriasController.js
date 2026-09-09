const { db } = require('../database/db');

function listar(req, res) {
  const categorias = db.prepare(
    'SELECT * FROM categorias WHERE usuario_id IS NULL OR usuario_id = ? ORDER BY nome'
  ).all(req.usuario.id);
  res.json(categorias);
}

function resumoPorCategoria(req, res) {
  const { mes, ano, tipo = 'saida' } = req.query;
  let sql = `
    SELECT c.id, c.nome, c.cor, SUM(ABS(t.valor)) AS total
    FROM transacoes t
    JOIN categorias c ON c.id = t.categoria_id
    WHERE t.usuario_id = ? AND t.tipo = ?
  `;
  const params = [req.usuario.id, tipo];

  if (mes) { sql += " AND strftime('%m', t.data) = ?"; params.push(String(mes).padStart(2, '0')); }
  if (ano) { sql += " AND strftime('%Y', t.data) = ?"; params.push(String(ano)); }

  sql += ' GROUP BY c.id ORDER BY total DESC';
  res.json(db.prepare(sql).all(...params));
}

module.exports = { listar, resumoPorCategoria };
