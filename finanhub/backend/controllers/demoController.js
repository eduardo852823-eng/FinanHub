const { db } = require('../database/db');

const BANCOS_DEMO = ['inter', 'nubank', 'caixa', 'bb'];

const TRANSACOES_DEMO = [
  { desc: 'Salário', valor: 2500, tipo: 'entrada', cat: 'Outros', dia: 1, banco: 'inter' },
  { desc: 'PIX recebido', valor: 100, tipo: 'entrada', cat: 'Outros', dia: 2, banco: 'inter' },
  { desc: 'IFOOD*RESTAURANTE', valor: -35.90, tipo: 'saida', cat: 'Alimentação', dia: 3, banco: 'inter' },
  { desc: 'UBER *TRIP', valor: -18.50, tipo: 'saida', cat: 'Transporte', dia: 5, banco: 'nubank' },
  { desc: 'NETFLIX.COM', valor: -45.90, tipo: 'saida', cat: 'Entretenimento', dia: 12, banco: 'nubank' },
  { desc: 'STEAM GAMES', valor: -29.99, tipo: 'saida', cat: 'Entretenimento', dia: 8, banco: 'caixa' },
  { desc: 'MERCADO BOM PRECO', valor: -120.30, tipo: 'saida', cat: 'Alimentação', dia: 14, banco: 'caixa' },
  { desc: 'CONTA DE LUZ', valor: -210, tipo: 'saida', cat: 'Contas', dia: 10, banco: 'caixa' },
];

/**
 * Ativa o modo demonstração: cria contas conectadas fictícias e transações de exemplo
 * para o usuário autenticado, sem tocar em nenhuma credencial bancária real.
 */
function ativar(req, res) {
  const usuarioId = req.usuario.id;

  const transacao = db.transaction(() => {
    BANCOS_DEMO.forEach(slug => {
      const inst = db.prepare('SELECT * FROM instituicoes WHERE slug = ?').get(slug);
      if (!inst) return;

      let conta = db.prepare('SELECT * FROM contas WHERE usuario_id = ? AND instituicao_id = ?').get(usuarioId, inst.id);
      if (!conta) {
        const saldo = Math.round(Math.random() * 2000 * 100) / 100;
        const info = db.prepare('INSERT INTO contas (usuario_id, instituicao_id, saldo, conectado) VALUES (?, ?, ?, 1)')
          .run(usuarioId, inst.id, saldo);
        conta = { id: info.lastInsertRowid };
      } else {
        db.prepare('UPDATE contas SET conectado = 1 WHERE id = ?').run(conta.id);
      }

      TRANSACOES_DEMO.filter(t => t.banco === slug).forEach(t => {
        const cat = db.prepare('SELECT id FROM categorias WHERE nome = ? AND usuario_id IS NULL').get(t.cat);
        const data = new Date(2026, 0, t.dia).toISOString();
        db.prepare(`
          INSERT INTO transacoes (usuario_id, conta_id, instituicao_id, data, descricao, valor, tipo, categoria_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(usuarioId, conta.id, inst.id, data, t.desc, t.valor, t.tipo, cat ? cat.id : null);
      });
    });
  });

  transacao();
  res.json({ ok: true, mensagem: 'Dados de demonstração criados.' });
}

module.exports = { ativar };
