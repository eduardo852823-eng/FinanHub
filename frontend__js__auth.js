/**
 * auth.js — fluxo de login/cadastro.
 *
 * "Entrar com Google" usa o Google Identity Services: se GOOGLE_CLIENT_ID
 * estiver configurado no servidor, renderiza o botão oficial do Google e
 * envia o token recebido para POST /api/auth/google, que o backend valida.
 * Sem GOOGLE_CLIENT_ID configurado, informa como concluir a configuração.
 * "Entrar com e-mail" chama POST /api/auth/login quando o backend está no ar;
 * se a chamada falhar, mostra o erro para que a pessoa possa corrigi-lo.
 */

const API_BASE = window.FINANHUB_CONFIG?.API_BASE_URL || 'http://localhost:3000/api';
let GOOGLE_CLIENT_ID = '';

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
    if (!resp.ok) throw new Error('Falha no login com Google');
    const data = await resp.json();
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Não foi possível entrar com o Google. Tente novamente.');
  }
}

async function carregarConfiguracaoGoogle() {
  try {
    const resposta = await fetch(`${API_BASE}/config`);
    if (!resposta.ok) return;
    const config = await resposta.json();
    GOOGLE_CLIENT_ID = config.googleClientId || '';
  } catch (_) {
    // O botão continua informando que a configuração do Google está ausente.
  }
}

async function renderBotaoGoogle(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  await carregarConfiguracaoGoogle();

  if (!GOOGLE_CLIENT_ID) {
    // Sem Client ID configurado ainda: deixa explícito que o provedor precisa ser configurado.
    container.innerHTML = `
      <button class="btn btn-secondary" type="button" onclick="informarGoogleNaoConfigurado()">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1h-9.17v2.92h5.4c-.23 1.4-1.63 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.59-2.5C16.95 3.4 14.75 2.5 12.18 2.5 6.98 2.5 2.78 6.7 2.78 11.9s4.2 9.4 9.4 9.4c5.42 0 9.02-3.8 9.02-9.16 0-.62-.07-1.09-.15-1.54z"/></svg>
        Entrar com Google (configurar Client ID)
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

function informarGoogleNaoConfigurado() {
  toast('Login Google indisponível: configure GOOGLE_CLIENT_ID no arquivo .env.');
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
    if (!resp.ok) throw new Error((await resp.json()).erro || 'Erro ao entrar');
    const data = await resp.json();
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Não foi possível entrar. Verifique seus dados e tente novamente.');
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
    if (!resp.ok) throw new Error((await resp.json()).erro || 'Erro ao criar conta');
    const data = await resp.json();
    salvarSessao(data.usuario, data.token);
    window.location.href = 'dashboard.html';
  } catch (e) {
    toast(e.message || 'Não foi possível criar a conta. Tente novamente.');
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
  setTimeout(() => el.classList.remove('show'), 1800);
}
