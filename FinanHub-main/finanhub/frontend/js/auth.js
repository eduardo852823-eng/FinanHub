/**
 * auth.js — fluxo de login/cadastro.
 *
 * "Entrar com Google" usa o Google Identity Services: com GOOGLE_CLIENT_ID
 * configurado em config.js, renderiza o botão oficial do Google e envia o
 * token recebido para POST /api/auth/google, que o backend valida.
 * "Entrar com e-mail" chama POST /api/auth/login / /api/auth/cadastro.
 * Em caso de erro (backend fora do ar, credenciais inválidas etc.), mostra
 * um aviso — não há mais fallback para modo demonstração sem login.
 */

const API_BASE = window.FINANHUB_CONFIG?.API_BASE_URL || 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = window.FINANHUB_CONFIG?.GOOGLE_CLIENT_ID || '';

function salvarSessao(usuario, token) {
  try {
    sessionStorage.setItem('finanhub_token', token);
    sessionStorage.setItem('finanhub_usuario', JSON.stringify(usuario));
  } catch (e) { /* ignore */ }
}

async function enviarCredencialGoogle(response) {
  try {
    const resp = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.erro || 'Falha no login com Google.');
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Erro ao entrar com Google.');
  }
}

function renderBotaoGoogle(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!GOOGLE_CLIENT_ID) {
    container.innerHTML = `
      <button class="btn btn-secondary" type="button" disabled style="opacity:0.6; cursor:not-allowed;">
        Google (configure GOOGLE_CLIENT_ID)
      </button>`;
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = () => {
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: enviarCredencialGoogle });
    google.accounts.id.renderButton(container, { theme: 'filled_blue', size: 'large', width: 280, shape: 'pill' });
  };
  document.head.appendChild(script);
}

function irParaEmail() {
  window.location.href = 'login.html?modo=email';
}

async function enviarLoginEmail(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector('input[type=email]').value;
  const senha = form.querySelector('input[type=password]').value;
  toast('Entrando…');
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.erro || 'E-mail ou senha inválidos.');
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Erro ao entrar.');
  }
}

async function enviarCadastro(event) {
  event.preventDefault();
  const form = event.target;
  const [nomeInput, emailInput, senhaInput] = form.querySelectorAll('input');
  toast('Criando conta…');
  try {
    const resp = await fetch(`${API_BASE}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeInput.value, email: emailInput.value, senha: senhaInput.value }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.erro || 'Erro ao criar conta.');
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Erro ao criar conta.');
  }
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}
