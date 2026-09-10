(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const lista = document.getElementById('lista-transacoes');
  const busca = document.getElementById('busca');
  const filtroBanco = document.getElementById('filtro-banco');
  const filtroTipo = document.getElementById('filtro-tipo');

  // popular filtro de bancos com os conectados
  state.accounts.filter(a => a.connected).forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.bankId;
    opt.textContent = FinanHub.BANKS[acc.bankId].name;
    filtroBanco.appendChild(opt);
  });

  function iconFor(tx) {
    const cat = FinanHub.CATEGORIES[tx.categoriaId];
    return { bg: cat.color, letter: cat.name[0] };
  }

  function render() {
    const termo = busca.value.trim().toLowerCase();
    const bancoF = filtroBanco.value;
    const tipoF = filtroTipo.value;

    const filtradas = state.transacoes.filter(t => {
      if (termo && !t.descricao.toLowerCase().includes(termo)) return false;
      if (bancoF && t.bankId !== bancoF) return false;
      if (tipoF && t.tipo !== tipoF) return false;
      return true;
    }).sort((a, b) => new Date(b.data) - new Date(a.data));

    lista.innerHTML = '';
    if (filtradas.length === 0) {
      lista.innerHTML = `<div class="empty-state">Nenhuma transação encontrada.</div>`;
      return;
    }

    let mesAtual = null;
    filtradas.forEach(t => {
      const data = new Date(t.data);
      const label = FinanHub.monthLabel(data);
      if (label !== mesAtual) {
        mesAtual = label;
        const h = document.createElement('div');
        h.className = 'tx-group-label';
        h.textContent = label;
        lista.appendChild(h);
      }
      const bank = FinanHub.BANKS[t.bankId];
      const ic = iconFor(t);
      const row = document.createElement('a');
      row.href = `transacao-detalhe.html?id=${t.id}`;
      row.className = 'tx-row';
      row.style.textDecoration = 'none';
      row.style.color = 'inherit';
      row.innerHTML = `
        <div class="tx-icon" style="background:${ic.bg}">${ic.letter}</div>
        <div class="tx-info">
          <div class="title">${t.descricao}</div>
          <div class="subtitle">${bank.name} · ${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
        </div>
        <div class="tx-amount ${t.valor >= 0 ? 'text-green' : 'text-red'}">${FinanHub.fmtBRLSigned(t.valor)}</div>
      `;
      lista.appendChild(row);
    });
  }

  busca.addEventListener('input', render);
  filtroBanco.addEventListener('change', render);
  filtroTipo.addEventListener('change', render);
  render();
})();
