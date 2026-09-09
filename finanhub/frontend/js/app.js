/**
 * FinanHub — app.js
 * Estado global do modo demonstração + helpers compartilhados por todas as telas.
 * Quando a integração real (Open Finance) existir, este módulo deve ser trocado
 * por chamadas à API REST do backend (ver backend/routes). As funções abaixo
 * já simulam o mesmo formato de dados que a API deve devolver.
 */

const FinanHub = (() => {
  const STORAGE_KEY = 'finanhub_demo_state_v1';

  const BANKS = {
    inter: { name: 'Banco Inter', short: 'inter', color: '#f97316' },
    bb: { name: 'Banco do Brasil', short: 'BB', color: '#eab308' },
    caixa: { name: 'Caixa Econômica', short: 'CX', color: '#0ea5e9' },
    nubank: { name: 'Nubank', short: 'nu', color: '#a855f7' },
    itau: { name: 'Itaú', short: 'itaú', color: '#f97316' },
    bradesco: { name: 'Bradesco', short: 'brad', color: '#dc2626' },
    santander: { name: 'Santander', short: 'sant', color: '#dc2626' },
    brb: { name: 'BRB', short: 'brb', color: '#3b82f6' },
    c6: { name: 'C6 Bank', short: 'C6', color: '#1f2937' },
    btg: { name: 'BTG Pactual', short: 'btg', color: '#0f172a' },
    mercadopago: { name: 'Mercado Pago', short: 'mp', color: '#0ea5e9' },
    sicoob: { name: 'Sicoob', short: 'sic', color: '#16a34a' },
    sicredi: { name: 'Sicredi', short: 'sicr', color: '#16a34a' },
  };

  const CATEGORIES = {
    alimentacao: { name: 'Alimentação', color: '#f97316', icon: 'utensils' },
    transporte: { name: 'Transporte', color: '#3b82f6', icon: 'car' },
    entretenimento: { name: 'Entretenimento', color: '#a855f7', icon: 'play' },
    contas: { name: 'Contas', color: '#eab308', icon: 'file' },
    compras: { name: 'Compras', color: '#ef4444', icon: 'bag' },
    saude: { name: 'Saúde', color: '#22c55e', icon: 'heart' },
    educacao: { name: 'Educação', color: '#0ea5e9', icon: 'book' },
    outros: { name: 'Outros', color: '#9aa4bd', icon: 'dots' },
  };

  // Regras simples de categorização automática (por palavra-chave na descrição)
  const AUTO_RULES = [
    { match: /ifood|restaurante|mercado|padaria|lanchonete/i, cat: 'alimentacao' },
    { match: /uber|99|posto|combustivel|estacionamento/i, cat: 'transporte' },
    { match: /netflix|steam|spotify|cinema|prime video/i, cat: 'entretenimento' },
    { match: /luz|agua|internet|telefone|condominio|energia/i, cat: 'contas' },
    { match: /amazon|shopee|magalu|loja/i, cat: 'compras' },
    { match: /farmacia|drogaria|clinica|hospital/i, cat: 'saude' },
    { match: /curso|faculdade|udemy|escola/i, cat: 'educacao' },
  ];

  function seedDemoData() {
    const accounts = [
      { id: 'inter', bankId: 'inter', connected: true, saldo: 1820.30 },
      { id: 'nubank', bankId: 'nubank', connected: true, saldo: 843.60 },
      { id: 'caixa', bankId: 'caixa', connected: true, saldo: 704.20 },
      { id: 'bb', bankId: 'bb', connected: false, saldo: 0 },
    ];

    const rawTx = [
      { desc: 'Salário', bank: 'inter', valor: 2500.00, tipo: 'entrada', cat: 'outros', dia: 1 },
      { desc: 'PIX recebido', bank: 'inter', valor: 100.00, tipo: 'entrada', cat: 'outros', dia: 2 },
      { desc: 'IFOOD*RESTAURANTE', bank: 'inter', valor: -35.90, tipo: 'saida', cat: 'alimentacao', dia: 3 },
      { desc: 'Aluguel', bank: 'caixa', valor: -1300.00, tipo: 'saida', cat: 'contas', dia: 4 },
      { desc: 'UBER *TRIP', bank: 'nubank', valor: -18.50, tipo: 'saida', cat: 'transporte', dia: 5 },
      { desc: 'Freelance', bank: 'nubank', valor: 900.00, tipo: 'entrada', cat: 'outros', dia: 6 },
      { desc: 'NETFLIX.COM', bank: 'nubank', valor: -45.90, tipo: 'saida', cat: 'entretenimento', dia: 12 },
      { desc: 'STEAM GAMES', bank: 'caixa', valor: -29.99, tipo: 'saida', cat: 'entretenimento', dia: 8 },
      { desc: 'MERCADO BOM PRECO', bank: 'caixa', valor: -120.30, tipo: 'saida', cat: 'alimentacao', dia: 14 },
      { desc: 'POSTO SHELL', bank: 'inter', valor: -180.00, tipo: 'saida', cat: 'transporte', dia: 9 },
      { desc: 'FARMACIA SAO PAULO', bank: 'inter', valor: -64.20, tipo: 'saida', cat: 'saude', dia: 15 },
      { desc: 'AMAZON.COM.BR', bank: 'nubank', valor: -189.70, tipo: 'saida', cat: 'compras', dia: 17 },
      { desc: 'CONTA DE LUZ', bank: 'caixa', valor: -210.00, tipo: 'saida', cat: 'contas', dia: 10 },
      { desc: 'CONTA DE INTERNET', bank: 'inter', valor: -99.90, tipo: 'saida', cat: 'contas', dia: 11 },
      { desc: 'UDEMY CURSO', bank: 'nubank', valor: -49.90, tipo: 'saida', cat: 'educacao', dia: 20 },
      { desc: 'IFOOD*LANCHONETE', bank: 'nubank', valor: -28.40, tipo: 'saida', cat: 'alimentacao', dia: 22 },
      { desc: '99 CORRIDA', bank: 'inter', valor: -22.30, tipo: 'saida', cat: 'transporte', dia: 24 },
      { desc: 'CINEMA SHOPPING', bank: 'caixa', valor: -60.00, tipo: 'saida', cat: 'entretenimento', dia: 26 },
    ];

    const ano = 2026, mes = 0; // Janeiro/2026
    const transacoes = rawTx.map((t, i) => ({
      id: 'tx_' + (i + 1),
      descricao: t.desc,
      bankId: t.bank,
      valor: t.valor,
      tipo: t.tipo,
      categoriaId: t.cat,
      data: new Date(ano, mes, t.dia).toISOString(),
      manualCategoria: false,
    }));

    return { accounts, transacoes, demoAtivo: true, usuario: { nome: 'Dudu', email: 'dudu@email.com' } };
  }

  function load() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* sessionStorage indisponível */ }
    const seeded = seedDemoData();
    save(seeded);
    return seeded;
  }

  function save(state) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function getState() { return load(); }

  function updateTransactionCategory(txId, categoriaId) {
    const state = getState();
    const tx = state.transacoes.find(t => t.id === txId);
    if (tx) { tx.categoriaId = categoriaId; tx.manualCategoria = true; }
    save(state);
    return state;
  }

  function fmtBRL(v) {
    const sign = v < 0 ? '- ' : '';
    return sign + Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', 'R$ ').replace('R$  ', 'R$ ');
  }

  function fmtBRLSigned(v) {
    const sign = v >= 0 ? '+ ' : '- ';
    return sign + Math.abs(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function monthLabel(date) {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  function totals(transacoes) {
    const entradas = transacoes.filter(t => t.valor > 0).reduce((s, t) => s + t.valor, 0);
    const saidas = transacoes.filter(t => t.valor < 0).reduce((s, t) => s + t.valor, 0);
    return { entradas, saidas: Math.abs(saidas), saldo: entradas + saidas };
  }

  function byCategory(transacoes) {
    const map = {};
    transacoes.filter(t => t.valor < 0).forEach(t => {
      map[t.categoriaId] = (map[t.categoriaId] || 0) + Math.abs(t.valor);
    });
    return map;
  }

  function requireDemoOrRedirect() {
    // Garante que sempre há um estado carregado (modo demo é o padrão do protótipo)
    return getState();
  }

  return {
    BANKS, CATEGORIES, AUTO_RULES,
    getState, save, updateTransactionCategory,
    fmtBRL, fmtBRLSigned, monthLabel, totals, byCategory,
    requireDemoOrRedirect,
  };
})();
