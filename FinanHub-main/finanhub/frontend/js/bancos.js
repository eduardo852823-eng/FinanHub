(function () {
  async function init() {
    const auth = FinanHub.requireAuth();
    if (!auth) return;

    const lista = document.getElementById('lista-instituicoes');
    let instituicoes = [];
    let bancoSelecionado = null;

    async function carregar() {
      try {
        instituicoes = await FinanHub.getInstituicoes();
      } catch (e) {
        lista.innerHTML = `<div class="empty-state">Erro ao carregar instituições.</div>`;
        return;
      }
      render();
    }

    function render() {
      lista.innerHTML = '';
      instituicoes.forEach(inst => {
        const conectado = !!inst.conectado;
        const row = document.createElement('div');
        row.className = 'institution-row';
        row.innerHTML = `
          <div class="bank-icon" style="background:${inst.cor}">${inst.nome.slice(0, 2).toUpperCase()}</div>
          <div class="institution-info">
            <div class="name">${inst.nome}</div>
            <div class="status ${conectado ? 'connected' : ''}">${conectado ? 'Conectado' : 'Não conectado'}</div>
          </div>
          ${conectado
            ? `<button class="connect" data-slug="${inst.slug}" data-acao="desconectar">Desconectar</button>`
            : `<button class="connect" data-slug="${inst.slug}" data-acao="conectar">Conectar</button>`}
        `;
        lista.appendChild(row);
      });

      lista.querySelectorAll('button.connect').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.acao === 'conectar') abrirModal(btn.dataset.slug);
          else desconectar(btn.dataset.slug);
        });
      });
    }

    async function desconectar(slug) {
      try {
        await FinanHub.desconectarInstituicao(slug);
        await carregar();
      } catch (e) { console.error(e); }
    }

    // Abre o modal. Sem slug (botão "+"), mostra um seletor com as
    // instituições ainda não conectadas.
    window.abrirModal = function (slug) {
      const wrap = document.getElementById('modal-select-wrap');
      const select = document.getElementById('modal-select-instituicao');

      if (slug) {
        bancoSelecionado = slug;
        wrap.style.display = 'none';
        const inst = instituicoes.find(i => i.slug === slug);
        document.getElementById('modal-titulo').textContent = inst ? `Conectar ${inst.nome}` : 'Conectar instituição';
      } else {
        const disponiveis = instituicoes.filter(i => !i.conectado);
        if (disponiveis.length === 0) return;
        select.innerHTML = disponiveis.map(i => `<option value="${i.slug}">${i.nome}</option>`).join('');
        bancoSelecionado = disponiveis[0].slug;
        select.onchange = () => { bancoSelecionado = select.value; };
        wrap.style.display = 'block';
        document.getElementById('modal-titulo').textContent = 'Conectar instituição';
      }

      document.getElementById('modal-conectar').classList.add('open');
    };

    window.fecharModal = function () {
      document.getElementById('modal-conectar').classList.remove('open');
    };

    window.confirmarConexao = async function () {
      if (bancoSelecionado) {
        try {
          await FinanHub.conectarInstituicao(bancoSelecionado);
          await carregar();
        } catch (e) { console.error(e); }
      }
      fecharModal();
    };

    carregar();
  }

  init();
})();
