(function () {
  async function init() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    const lista = document.getElementById('lista-transacoes');
    const busca = document.getElementById('busca');
    const filtroBanco = document.getElementById('filtro-banco');
    const filtroTipo = document.getElementById('filtro-tipo');

    try {
      const instituicoes = await FinanHub.getInstituicoes();
      instituicoes.filter(i => i.conectado).forEach(inst => {
        const opt = document.createElement('option');
        opt.value = inst.slug;
        opt.textContent = inst.nome;
        filtroBanco.appendChild(opt);
      });
    } catch (e) {
      console.error(e);
    }

    async function render() {
      const filtros = {
        busca: busca.value.trim() || undefined,
        banco: filtroBanco.value || undefined,
        tipo: filtroTipo.value || undefined,
      };

      let transacoes;
      try {
        transacoes = await FinanHub.getTransacoes(filtros);
      } catch (e) {
        lista.innerHTML = `<div class="empty-state">Erro ao carregar transações.</div>`;
        return;
      }

      lista.innerHTML = '';
      if (transacoes.length === 0) {
        lista.innerHTML = `<div class="empty-state">Nenhuma transação encontrada.</div>`;
        return;
      }

      let mesAtual = null;
      transacoes.forEach(t => {
        const data = new Date(t.data);
        const label = FinanHub.monthLabel(data);
        if (label !== mesAtual) {
          mesAtual = label;
          const h = document.createElement('div');
          h.className = 'tx-group-label';
          h.textContent = label;
          lista.appendChild(h);
        }
        const row = document.createElement('a');
        row.href = `transacao-detalhe.html?id=${t.id}`;
        row.className = 'tx-row';
        row.style.textDecoration = 'none';
        row.style.color = 'inherit';
        row.innerHTML = `
          <div class="tx-icon" style="background:${t.categoria_cor || '#9aa4bd'}">${(t.categoria_nome || '?')[0]}</div>
          <div class="tx-info">
            <div class="title">${t.descricao}</div>
            <div class="subtitle">${t.instituicao_nome} · ${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
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
  }

  init();
})();
