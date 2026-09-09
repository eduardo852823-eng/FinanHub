(function () {
  const state = FinanHub.requireDemoOrRedirect();
  const lista = document.getElementById('lista-instituicoes');
  let bancoSelecionado = null;

  function render() {
    lista.innerHTML = '';
    const connectedIds = new Set(state.accounts.map(a => a.bankId));
    Object.entries(FinanHub.BANKS).forEach(([id, bank]) => {
      const acc = state.accounts.find(a => a.bankId === id);
      const conectado = acc && acc.connected;
      const row = document.createElement('div');
      row.className = 'institution-row';
      row.innerHTML = `
        <div class="bank-icon" style="background:${bank.color}">${bank.short}</div>
        <div class="institution-info">
          <div class="name">${bank.name}</div>
          <div class="status ${conectado ? 'connected' : ''}">${conectado ? 'Conectado' : 'Não conectado'}</div>
        </div>
        ${conectado
          ? `<svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : `<button class="connect" data-bank="${id}">Conectar</button>`}
      `;
      lista.appendChild(row);
    });

    lista.querySelectorAll('button.connect').forEach(btn => {
      btn.addEventListener('click', () => abrirModal(btn.dataset.bank));
    });
  }

  window.abrirModal = function (bankId) {
    bancoSelecionado = bankId || null;
    const bank = bankId ? FinanHub.BANKS[bankId] : null;
    document.getElementById('modal-titulo').textContent = bank ? `Conectar ${bank.name}` : 'Conectar instituição';
    document.getElementById('modal-conectar').classList.add('open');
  };

  window.fecharModal = function () {
    document.getElementById('modal-conectar').classList.remove('open');
  };

  window.confirmarConexao = function () {
    if (bancoSelecionado) {
      let acc = state.accounts.find(a => a.bankId === bancoSelecionado);
      if (!acc) {
        acc = { id: bancoSelecionado, bankId: bancoSelecionado, connected: true, saldo: Math.round(Math.random() * 2000) };
        state.accounts.push(acc);
      } else {
        acc.connected = true;
      }
      FinanHub.save(state);
      render();
    }
    fecharModal();
  };

  render();
})();
