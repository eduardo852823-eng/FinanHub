(function () {
  async function init() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    let resumoAtual;
    try {
      resumoAtual = await FinanHub.getResumo();
    } catch (e) {
      console.error(e);
      return;
    }

    document.getElementById('rel-entradas').textContent = FinanHub.fmtBRL(resumoAtual.entradas);
    document.getElementById('rel-saidas').textContent = FinanHub.fmtBRL(resumoAtual.saidas);
    const resultadoEl = document.getElementById('rel-resultado');
    resultadoEl.textContent = FinanHub.fmtBRLSigned(resumoAtual.resultado);
    resultadoEl.classList.add(resumoAtual.resultado >= 0 ? 'text-green' : 'text-red');

    const hoje = new Date();
    document.getElementById('mes-atual').textContent = FinanHub.monthLabel(hoje);

    // Evolução dos últimos 6 meses (uma chamada de resumo por mês, em paralelo)
    const periodos = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      periodos.push({
        mes: d.getMonth() + 1,
        ano: d.getFullYear(),
        label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      });
    }
    const resumosMensais = await Promise.all(
      periodos.map(p => FinanHub.getResumo({ mes: p.mes, ano: p.ano }).catch(() => ({ entradas: 0, saidas: 0 })))
    );

    new Chart(document.getElementById('chart-evolucao'), {
      type: 'bar',
      data: {
        labels: periodos.map(p => p.label),
        datasets: [
          { label: 'Entradas', data: resumosMensais.map(r => r.entradas), backgroundColor: '#22c55e', borderRadius: 4, maxBarThickness: 14 },
          { label: 'Saídas', data: resumosMensais.map(r => r.saidas), backgroundColor: '#ef4444', borderRadius: 4, maxBarThickness: 14 },
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

    // Compara o mês atual com o mesmo mês do ano anterior.
    // (O seletor "mes-a" no HTML ainda tem opções fixas — trocar por um
    // seletor dinâmico é um próximo passo natural, se você quiser.)
    window.gerarComparacao = async function () {
      const mesB = hoje.getMonth() + 1, anoB = hoje.getFullYear();
      const mesA = mesB, anoA = anoB - 1;

      let comp;
      try {
        comp = await FinanHub.getComparar({ mesA, anoA, mesB, anoB });
      } catch (e) {
        console.error(e);
        return;
      }

      const box = document.getElementById('resultado-comparacao');
      box.style.display = 'block';
      const el = document.getElementById('comp-variacao');
      const variacao = comp.variacaoPct !== null ? Number(comp.variacaoPct) : 0;
      const positivo = variacao >= 0;
      el.textContent = `${positivo ? '↑' : '↓'} ${Math.abs(variacao)}%`;
      el.className = 'card-value ' + (positivo ? 'text-red' : 'text-green');
      document.getElementById('comp-detalhe').textContent =
        `${FinanHub.fmtBRL(Math.abs(comp.periodoB.total - comp.periodoA.total))} de diferença comparado ao mesmo mês do ano anterior.`;
    };
  }

  init();
})();
