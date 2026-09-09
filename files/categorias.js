(function () {
  async function init() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    const lista = document.getElementById('lista-categorias');
    const tabs = document.querySelectorAll('.tab-toggle button');
    let modo = 'gastos';

    async function render() {
      const tipo = modo === 'gastos' ? 'saida' : 'entrada';
      let dados;
      try {
        dados = await FinanHub.getResumoCategorias({ tipo });
      } catch (e) {
        lista.innerHTML = `<div class="empty-state">Erro ao carregar categorias.</div>`;
        return;
      }

      const total = dados.reduce((s, c) => s + c.total, 0);

      lista.innerHTML = '';
      if (dados.length === 0) {
        lista.innerHTML = `<div class="empty-state">Nenhum registro neste período.</div>`;
        return;
      }

      dados.forEach(c => {
        const pct = total ? ((c.total / total) * 100).toFixed(1) : '0.0';
        const row = document.createElement('div');
        row.className = 'cat-row';
        row.innerHTML = `
          <div class="cat-icon" style="background:${c.cor}">${c.nome[0]}</div>
          <div class="cat-info">
            <div class="name">${c.nome}</div>
            <div class="bar-bg"><div class="bar-fill" style="width:${pct}%; background:${c.cor}"></div></div>
          </div>
          <div class="cat-value">
            <div class="amount">${FinanHub.fmtBRL(c.total)}</div>
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
  }

  init();
})();
