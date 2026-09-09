(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const { entradas, saidas, saldo } = FinanHub.totals(state.transacoes);

  document.getElementById('saudacao').textContent = `Olá, ${state.usuario.nome}!`;
  document.getElementById('saldo-total').textContent = FinanHub.fmtBRL(saldo);
  document.getElementById('total-entradas').textContent = FinanHub.fmtBRL(entradas);
  document.getElementById('total-saidas').textContent = FinanHub.fmtBRL(saidas);

  // Bancos conectados
  const bancosEl = document.getElementById('lista-bancos');
  state.accounts.filter(a => a.connected).forEach(acc => {
    const bank = FinanHub.BANKS[acc.bankId];
    const chip = document.createElement('div');
    chip.className = 'bank-chip';
    chip.innerHTML = `
      <div class="bank-icon" style="background:${bank.color}">${bank.short}</div>
      <div class="text-muted" style="font-size:11px;">${bank.name}</div>
      <div class="amount">${FinanHub.fmtBRL(acc.saldo)}</div>
    `;
    bancosEl.appendChild(chip);
  });

  // Gastos por categoria
  const porCategoria = FinanHub.byCategory(state.transacoes);
  const entries = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([id]) => FinanHub.CATEGORIES[id].name);
  const values = entries.map(([, v]) => v);
  const colors = entries.map(([id]) => FinanHub.CATEGORIES[id].color);

  new Chart(document.getElementById('chart-categorias'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      cutout: '68%',
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });

  const total = values.reduce((a, b) => a + b, 0);
  const legendEl = document.getElementById('legenda-categorias');
  entries.forEach(([id, v]) => {
    const cat = FinanHub.CATEGORIES[id];
    const pct = ((v / total) * 100).toFixed(1);
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="dot" style="background:${cat.color}"></span>${cat.name} ${pct}%`;
    legendEl.appendChild(item);
  });
})();
