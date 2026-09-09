(function () {
  let tx = null;
  let categorias = [];
  let categoriaSelecionada = null;
  const id = new URLSearchParams(location.search).get('id');

  async function carregar() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    try {
      const [transacoes, cats] = await Promise.all([
        FinanHub.getTransacoes(),
        FinanHub.getCategorias(),
      ]);
      categorias = cats;
      tx = transacoes.find(t => String(t.id) === String(id));
      categoriaSelecionada = tx ? tx.categoria_id : null;
      render();
    } catch (e) {
      document.getElementById('detalhe').innerHTML = `<div class="empty-state">Erro ao carregar transação.</div>`;
    }
  }

  function render() {
    if (!tx) {
      document.getElementById('detalhe').innerHTML = `<div class="empty-state">Transação não encontrada.</div>`;
      return;
    }
    const data = new Date(tx.data);
    document.getElementById('detalhe').innerHTML = `
      <div style="text-align:center; padding: var(--space-6) 0;">
        <div class="card-value ${tx.valor >= 0 ? 'text-green' : 'text-red'}" style="font-size:32px;">${FinanHub.fmtBRLSigned(tx.valor)}</div>
        <div class="text-secondary" style="margin-top:6px;">${tx.descricao}</div>
        <div class="badge mt-2" style="background:${tx.categoria_cor}22; color:${tx.categoria_cor};">${tx.categoria_nome || 'Sem categoria'}</div>
      </div>
      <div class="card">
        <div class="link-row"><span class="text-muted grow">Banco</span><span class="font-bold">${tx.instituicao_nome}</span></div>
        <div class="link-row"><span class="text-muted grow">Data</span><span class="font-bold">${data.toLocaleDateString('pt-BR')}</span></div>
        <div class="link-row"><span class="text-muted grow">Descrição</span><span class="font-bold">${tx.descricao}</span></div>
        <div class="link-row"><span class="text-muted grow">Categoria</span><span class="font-bold">${tx.categoria_nome || 'Sem categoria'}</span></div>
      </div>
      <button class="btn btn-secondary mt-6" onclick="abrirModalCategoria()">Alterar categoria</button>
      <button class="btn btn-danger mt-2" onclick="excluirTransacao()">Excluir</button>
    `;
  }

  window.abrirModalCategoria = function () {
    const grid = document.getElementById('cat-grid');
    grid.innerHTML = '';
    categorias.forEach(cat => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cat-pick' + (cat.id === categoriaSelecionada ? ' selected' : '');
      el.dataset.cat = cat.id;
      el.innerHTML = `<div class="cat-icon" style="background:${cat.cor}">${cat.nome[0]}</div>${cat.nome}`;
      el.addEventListener('click', () => {
        categoriaSelecionada = cat.id;
        grid.querySelectorAll('.cat-pick').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
      });
      grid.appendChild(el);
    });
    document.getElementById('modal-categoria').classList.add('open');
  };

  window.salvarCategoria = async function () {
    try {
      await FinanHub.atualizarCategoriaTransacao(tx.id, categoriaSelecionada);
      document.getElementById('modal-categoria').classList.remove('open');
      await carregar();
    } catch (e) { console.error(e); }
  };

  window.excluirTransacao = async function () {
    try {
      await FinanHub.excluirTransacao(tx.id);
      window.location.href = 'transacoes.html';
    } catch (e) { console.error(e); }
  };

  carregar();
})();
