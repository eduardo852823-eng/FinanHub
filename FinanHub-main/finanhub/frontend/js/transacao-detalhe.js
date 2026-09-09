(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const id = new URLSearchParams(location.search).get('id');
  let tx = state.transacoes.find(t => t.id === id);
  let categoriaSelecionada = tx ? tx.categoriaId : null;

  function render() {
    tx = state.transacoes.find(t => t.id === id);
    if (!tx) {
      document.getElementById('detalhe').innerHTML = `<div class="empty-state">Transação não encontrada.</div>`;
      return;
    }
    const bank = FinanHub.BANKS[tx.bankId];
    const cat = FinanHub.CATEGORIES[tx.categoriaId];
    const data = new Date(tx.data);
    document.getElementById('detalhe').innerHTML = `
      <div style="text-align:center; padding: var(--space-6) 0;">
        <div class="card-value ${tx.valor >= 0 ? 'text-green' : 'text-red'}" style="font-size:32px;">${FinanHub.fmtBRLSigned(tx.valor)}</div>
        <div class="text-secondary" style="margin-top:6px;">${tx.descricao}</div>
        <div class="badge mt-2" style="background:${cat.color}22; color:${cat.color};">${cat.name}</div>
      </div>
      <div class="card">
        <div class="link-row"><span class="text-muted grow">Banco</span><span class="font-bold">${bank.name}</span></div>
        <div class="link-row"><span class="text-muted grow">Data</span><span class="font-bold">${data.toLocaleDateString('pt-BR')}</span></div>
        <div class="link-row"><span class="text-muted grow">Descrição</span><span class="font-bold">${tx.descricao}</span></div>
        <div class="link-row"><span class="text-muted grow">Categoria</span><span class="font-bold">${cat.name}</span></div>
      </div>
      <button class="btn btn-secondary mt-6" onclick="abrirModalCategoria()">Alterar categoria</button>
      <button class="btn btn-danger mt-2" onclick="excluirTransacao()">Excluir</button>
    `;
  }

  window.abrirModalCategoria = function () {
    const grid = document.getElementById('cat-grid');
    grid.innerHTML = '';
    Object.entries(FinanHub.CATEGORIES).forEach(([id2, cat]) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cat-pick' + (id2 === categoriaSelecionada ? ' selected' : '');
      el.dataset.cat = id2;
      el.innerHTML = `<div class="cat-icon" style="background:${cat.color}">${cat.name[0]}</div>${cat.name}`;
      el.addEventListener('click', () => {
        categoriaSelecionada = id2;
        grid.querySelectorAll('.cat-pick').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
      });
      grid.appendChild(el);
    });
    document.getElementById('modal-categoria').classList.add('open');
  };

  window.salvarCategoria = function () {
    FinanHub.updateTransactionCategory(id, categoriaSelecionada);
    document.getElementById('modal-categoria').classList.remove('open');
    render();
  };

  window.excluirTransacao = function () {
    const st = FinanHub.getState();
    st.transacoes = st.transacoes.filter(t => t.id !== id);
    FinanHub.save(st);
    window.location.href = 'transacoes.html';
  };

  render();
})();
