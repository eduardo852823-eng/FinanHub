(function () {
  async function init() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    document.getElementById('saudacao').textContent = `Olá, ${auth.usuario.nome.split(' ')[0]}!`;

    const delta = document.querySelector('.card-delta');
    if (delta) delta.style.display = 'none'; // sem dado histórico comparável ainda

    try {
      const [resumo, instituicoes, resumoCategorias] = await Promise.all([
        FinanHub.getResumo(),
        FinanHub.getInstituicoes(),
        FinanHub.getResumoCategorias({ tipo: 'saida' }),
      ]);

      document.getElementById('saldo-total').textContent = FinanHub.fmtBRL(resumo.resultado);
      document.getElementById('total-entradas').textContent = FinanHub.fmtBRL(resumo.entradas);
      document.getElementById('total-saidas').textContent = FinanHub.fmtBRL(resumo.saidas);

      const bancosEl = document.getElementById('lista-bancos');
      instituicoes.filter(i => i.conectado).forEach(inst => {
        const chip = document.createElement('div');
        chip.className = 'bank-chip';
        chip.innerHTML = `
          <div class="bank-icon" style="background:${inst.cor}">${inst.nome.slice(0, 2).toUpperCase()}</div>
          <div class="text-muted" style="font-size:11px;">${inst.nome}</div>
          <div class="amount">${FinanHub.fmtBRL(inst.saldo || 0)}</div>
        `;
        bancosEl.appendChild(chip);
      });

      const labels = resumoCategorias.map(c => c.nome);
      const values = resumoCategorias.map(c => c.total);
      const colors = resumoCategorias.map(c => c.cor);

      new Chart(document.getElementById('chart-categorias'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }] },
        options: { cutout: '68%', plugins: { legend: { display: false } }, maintainAspectRatio: false },
      });

      const total = values.reduce((a, b) => a + b, 0);
      const legendEl = document.getElementById('legenda-categorias');
      resumoCategorias.forEach(c => {
        const pct = total ? ((c.total / total) * 100).toFixed(1) : '0.0';
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="dot" style="background:${c.cor}"></span>${c.nome} ${pct}%`;
        legendEl.appendChild(item);
      });
    } catch (e) {
      console.error(e);
    }
  }

  init();
})();
