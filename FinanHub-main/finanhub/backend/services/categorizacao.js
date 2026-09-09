const { db } = require('../database/db');

/**
 * Categoriza uma transação automaticamente com base em regras (palavra-chave -> categoria).
 * Prioriza regras criadas pelo próprio usuário (aprendidas a partir de correções manuais)
 * sobre as regras padrão do sistema. Deixa espaço para, no futuro, substituir esta
 * função por uma chamada a um modelo de classificação (IA).
 */
function categorizar(usuarioId, descricao) {
  const desc = descricao.toLowerCase();

  const regrasUsuario = db.prepare(
    'SELECT padrao, categoria_id FROM regras_categorizacao WHERE usuario_id = ?'
  ).all(usuarioId);

  const regrasSistema = db.prepare(
    'SELECT padrao, categoria_id FROM regras_categorizacao WHERE usuario_id IS NULL'
  ).all();

  for (const regra of [...regrasUsuario, ...regrasSistema]) {
    if (desc.includes(regra.padrao.toLowerCase())) {
      return regra.categoria_id;
    }
  }

  const outros = db.prepare(
    "SELECT id FROM categorias WHERE nome = 'Outros' AND usuario_id IS NULL"
  ).get();
  return outros ? outros.id : null;
}

/**
 * Registra/atualiza uma regra aprendida quando o usuário corrige manualmente a categoria
 * de uma transação, para melhorar classificações futuras de descrições parecidas.
 */
function aprenderComCorrecao(usuarioId, descricao, categoriaId) {
  const palavraChave = descricao.trim().split(/\s+/)[0].toLowerCase();
  const existente = db.prepare(
    'SELECT id FROM regras_categorizacao WHERE usuario_id = ? AND padrao = ?'
  ).get(usuarioId, palavraChave);

  if (existente) {
    db.prepare('UPDATE regras_categorizacao SET categoria_id = ? WHERE id = ?')
      .run(categoriaId, existente.id);
  } else {
    db.prepare(
      'INSERT INTO regras_categorizacao (usuario_id, padrao, categoria_id) VALUES (?, ?, ?)'
    ).run(usuarioId, palavraChave, categoriaId);
  }
}

module.exports = { categorizar, aprenderComCorrecao };
