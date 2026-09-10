(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const lista = document.getElementById('lista-categorias');
  const tabs = document.querySelectorAll('.tab-toggle button');
  let modo = 'gastos';

  function render() {
    const relevantes = state.transacoes.filter(t => modo === 'gastos' ? t.valor < 0 : t.valor > 0);
    const map = {};
    relevantes.forEach(t => { map[t.categoriaId] = (map[t.categoriaId] || 0) + Math.abs(t.valor); });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);

    lista.innerHTML = '';
    if (entries.length === 0) {
      lista.innerHTML = `<div class="empty-state">Nenhum registro neste período.</div>`;
      return;
    }

    entries.forEach(([id, valor]) => {
      const cat = FinanHub.CATEGORIES[id];
      const pct = ((valor / total) * 100).toFixed(1);
      const row = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <div class="cat-icon" style="background:${cat.color}">${cat.name[0]}</div>
        <div class="cat-info">
          <div class="name">${cat.name}</div>
          <div class="bar-bg"><div class="bar-fill" style="width:${pct}%; background:${cat.color}"></div></div>
        </div>
        <div class="cat-value">
          <div class="amount">${FinanHub.fmtBRL(valor)}</div>
          <div class="pct">${pct}%</div>
        </div>
      `;
      lista.appendChild(row);
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      modo = btn.dataset.tab;
      render();
    });
  });

  render();
})();
