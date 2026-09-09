const { db } = require('../database/db');

function resumo(req, res) {
  const { mes, ano, banco, categoria } = req.query;
  let sql = `
    SELECT t.tipo, SUM(ABS(t.valor)) AS total
    FROM transacoes t
    JOIN instituicoes i ON i.id = t.instituicao_id
    WHERE t.usuario_id = ?
  `;
  const params = [req.usuario.id];

  if (mes) { sql += " AND strftime('%m', t.data) = ?"; params.push(String(mes).padStart(2, '0')); }
  if (ano) { sql += " AND strftime('%Y', t.data) = ?"; params.push(String(ano)); }
  if (banco) { sql += ' AND i.slug = ?'; params.push(banco); }
  if (categoria) { sql += ' AND t.categoria_id = ?'; params.push(categoria); }

  sql += ' GROUP BY t.tipo';
  const linhas = db.prepare(sql).all(...params);

  const entradas = linhas.find(l => l.tipo === 'entrada')?.total || 0;
  const saidas = linhas.find(l => l.tipo === 'saida')?.total || 0;

  res.json({ entradas, saidas, resultado: entradas - saidas });
}

/**
 * Compara o resumo de dois períodos (ex: Janeiro/2025 vs Janeiro/2026),
 * opcionalmente filtrando por banco.
 */
function comparar(req, res) {
  const { mesA, anoA, mesB, anoB, banco } = req.query;

  function totalPeriodo(mes, ano) {
    let sql = `
      SELECT SUM(ABS(valor)) AS total FROM transacoes t
      JOIN instituicoes i ON i.id = t.instituicao_id
      WHERE t.usuario_id = ? AND t.tipo = 'saida'
        AND strftime('%m', t.data) = ? AND strftime('%Y', t.data) = ?
    `;
    const params = [req.usuario.id, String(mes).padStart(2, '0'), String(ano)];
    if (banco) { sql += ' AND i.slug = ?'; params.push(banco); }
    return db.prepare(sql).get(...params)?.total || 0;
  }

  const totalA = totalPeriodo(mesA, anoA);
  const totalB = totalPeriodo(mesB, anoB);
  const variacaoPct = totalA > 0 ? (((totalB - totalA) / totalA) * 100).toFixed(1) : null;

  res.json({ periodoA: { mes: mesA, ano: anoA, total: totalA }, periodoB: { mes: mesB, ano: anoB, total: totalB }, variacaoPct });
}

module.exports = { resumo, comparar };
