const { db } = require('../database/db');

function listar(req, res) {
  const contas = db.prepare(`
    SELECT i.id AS instituicao_id, i.slug, i.nome, i.cor,
           c.id AS conta_id, c.saldo, c.conectado
    FROM instituicoes i
    LEFT JOIN contas c ON c.instituicao_id = i.id AND c.usuario_id = ?
    ORDER BY i.nome
  `).all(req.usuario.id);

  res.json(contas);
}

/**
 * Simula a conexão de uma instituição (modo demonstração / pré-Open Finance).
 * Nunca recebe nem armazena senha bancária — apenas cria/ativa a conta local do usuário.
 * Quando o Open Finance estiver disponível, este endpoint deve iniciar o fluxo de
 * consentimento oficial em vez de ativar a conta diretamente.
 */
function conectar(req, res) {
  const { instituicao_slug } = req.body;
  const instituicao = db.prepare('SELECT * FROM instituicoes WHERE slug = ?').get(instituicao_slug);
  if (!instituicao) return res.status(404).json({ erro: 'Instituição não encontrada.' });

  let conta = db.prepare('SELECT * FROM contas WHERE usuario_id = ? AND instituicao_id = ?')
    .get(req.usuario.id, instituicao.id);

  if (conta) {
    db.prepare('UPDATE contas SET conectado = 1 WHERE id = ?').run(conta.id);
  } else {
    const saldoDemo = Math.round(Math.random() * 2000 * 100) / 100;
    const info = db.prepare('INSERT INTO contas (usuario_id, instituicao_id, saldo, conectado) VALUES (?, ?, ?, 1)')
      .run(req.usuario.id, instituicao.id, saldoDemo);
    conta = { id: info.lastInsertRowid };
  }

  db.prepare(`
    INSERT INTO consentimentos (usuario_id, instituicao_id, status, escopo, concedido_em)
    VALUES (?, ?, 'ativo', 'contas,transacoes', CURRENT_TIMESTAMP)
  `).run(req.usuario.id, instituicao.id);

  res.json({ ok: true, conta_id: conta.id });
}

function desconectar(req, res) {
  const { instituicao_slug } = req.body;
  const instituicao = db.prepare('SELECT * FROM instituicoes WHERE slug = ?').get(instituicao_slug);
  if (!instituicao) return res.status(404).json({ erro: 'Instituição não encontrada.' });

  db.prepare('UPDATE contas SET conectado = 0 WHERE usuario_id = ? AND instituicao_id = ?')
    .run(req.usuario.id, instituicao.id);
  db.prepare(`UPDATE consentimentos SET status = 'revogado' WHERE usuario_id = ? AND instituicao_id = ?`)
    .run(req.usuario.id, instituicao.id);

  res.json({ ok: true });
}

module.exports = { listar, conectar, desconectar };
