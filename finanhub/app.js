/**
 * FinanHub — app.js
 * Camada de acesso à API REST do backend + helpers de sessão e formatação,
 * usada por todas as telas autenticadas do app.
 */

const FinanHub = (() => {
  const API_BASE = window.FINANHUB_CONFIG?.API_BASE_URL || 'http://localhost:3000/api';

  function getToken() {
    try { return sessionStorage.getItem('finanhub_token'); } catch (e) { return null; }
  }

  function getUsuario() {
    try { return JSON.parse(sessionStorage.getItem('finanhub_usuario') || 'null'); }
    catch (e) { return null; }
  }

  function salvarSessao(usuario, token) {
    try {
      sessionStorage.setItem('finanhub_token', token);
      sessionStorage.setItem('finanhub_usuario', JSON.stringify(usuario));
    } catch (e) { /* sessionStorage indisponível */ }
  }

  function logout() {
    try {
      sessionStorage.removeItem('finanhub_token');
      sessionStorage.removeItem('finanhub_usuario');
    } catch (e) { /* ignore */ }
    window.location.href = 'login.html';
  }

  /** Garante que há uma sessão válida; senão, redireciona para o login. */
  function requireAuth() {
    const token = getToken();
    const usuario = getUsuario();
    if (!token || !usuario) {
      window.location.href = 'login.html';
      return null;
    }
    return { token, usuario };
  }

  async function api(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (resp.status === 401) {
      logout();
      throw new Error('Sessão expirada.');
    }

    let data = null;
    try { data = await resp.json(); } catch (e) { /* resposta sem corpo */ }

    if (!resp.ok) throw new Error((data && data.erro) || 'Erro na requisição.');
    return data;
  }

  function qs(filtros = {}) {
    const params = new URLSearchParams(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const str = params.toString();
    return str ? `?${str}` : '';
  }

  // Instituições
  const getInstituicoes = () => api('/instituicoes');
  const conectarInstituicao = (slug) => api('/instituicoes/conectar', { method: 'POST', body: JSON.stringify({ instituicao_slug: slug }) });
  const desconectarInstituicao = (slug) => api('/instituicoes/desconectar', { method: 'POST', body: JSON.stringify({ instituicao_slug: slug }) });

  // Transações
  const getTransacoes = (filtros) => api(`/transacoes${qs(filtros)}`);
  const criarTransacao = (dados) => api('/transacoes', { method: 'POST', body: JSON.stringify(dados) });
  const atualizarCategoriaTransacao = (id, categoria_id) => api(`/transacoes/${id}/categoria`, { method: 'PATCH', body: JSON.stringify({ categoria_id }) });
  const excluirTransacao = (id) => api(`/transacoes/${id}`, { method: 'DELETE' });

  // Categorias
  const getCategorias = () => api('/categorias');
  const getResumoCategorias = (filtros) => api(`/categorias/resumo${qs(filtros)}`);

  // Relatórios
  const getResumo = (filtros) => api(`/relatorios/resumo${qs(filtros)}`);
  const getComparar = (filtros) => api(`/relatorios/comparar${qs(filtros)}`);

  // Demo
  const ativarDemo = () => api('/demo/ativar', { method: 'POST' });

  function fmtBRL(v) {
    const sign = v < 0 ? '- ' : '';
    return sign + Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtBRLSigned(v) {
    const sign = v >= 0 ? '+ ' : '- ';
    return sign + Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function monthLabel(date) {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  return {
    getToken, getUsuario, salvarSessao, logout, requireAuth,
    getInstituicoes, conectarInstituicao, desconectarInstituicao,
    getTransacoes, criarTransacao, atualizarCategoriaTransacao, excluirTransacao,
    getCategorias, getResumoCategorias,
    getResumo, getComparar,
    ativarDemo,
    fmtBRL, fmtBRLSigned, monthLabel,
  };
})();
