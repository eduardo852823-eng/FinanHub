(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const { entradas, saidas, saldo } = FinanHub.totals(state.transacoes);

  document.getElementById('rel-entradas').textContent = FinanHub.fmtBRL(entradas);
  document.getElementById('rel-saidas').textContent = FinanHub.fmtBRL(saidas);
  const resultadoEl = document.getElementById('rel-resultado');
  resultadoEl.textContent = FinanHub.fmtBRLSigned(saldo);
  resultadoEl.classList.add(saldo >= 0 ? 'text-green' : 'text-red');

  // Gráfico de barras simulando evolução dos últimos meses (demo)
  const meses = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
  const entradasSerie = [3100, 3200, 3300, 3400, 3600, entradas];
  const saidasSerie = [2100, 2600, 2200, 2900, 3100, saidas];

  new Chart(document.getElementById('chart-evolucao'), {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { label: 'Entradas', data: entradasSerie, backgroundColor: '#22c55e', borderRadius: 4, maxBarThickness: 14 },
        { label: 'Saídas', data: saidasSerie, backgroundColor: '#ef4444', borderRadius: 4, maxBarThickness: 14 },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9aa4bd', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9aa4bd', font: { size: 11 } } },
      },
    },
  });

  // Alternar abas Geral / Comparar
  document.querySelectorAll('.screen > .tab-toggle > button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.screen > .tab-toggle > button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const isComparar = btn.dataset.tab === 'comparar';
      document.getElementById('aba-geral').style.display = isComparar ? 'none' : 'block';
      document.getElementById('aba-comparar').style.display = isComparar ? 'block' : 'none';
    });
  });

  window.gerarComparacao = function () {
    // Comparação simulada entre Jan/2025 (dado fictício) e o período atual carregado
    const anteriorSaidas = 2035;
    const variacaoPct = (((saidas - anteriorSaidas) / anteriorSaidas) * 100).toFixed(0);
    const box = document.getElementById('resultado-comparacao');
    box.style.display = 'block';
    const el = document.getElementById('comp-variacao');
    const positivo = Number(variacaoPct) >= 0;
    el.textContent = `${positivo ? '↑' : '↓'} ${Math.abs(variacaoPct)}%`;
    el.className = 'card-value ' + (positivo ? 'text-red' : 'text-green');
    document.getElementById('comp-detalhe').textContent =
      `${FinanHub.fmtBRL(Math.abs(saidas - anteriorSaidas))} a mais em Janeiro/2026 comparado a Janeiro/2025.`;
  };
})();
