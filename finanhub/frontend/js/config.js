/**
 * Configurações do frontend que dependem do ambiente.
 * Preencha GOOGLE_CLIENT_ID com o "Client ID" criado no Google Cloud Console
 * (veja o passo a passo em README.md > "Configurar login com Google").
 *
 * É seguro este valor ficar público no frontend — o Client ID não é segredo,
 * quem precisa ficar em segredo (GOOGLE_CLIENT_SECRET) fica só no backend/.env.
 */
window.FINANHUB_CONFIG = {
  GOOGLE_CLIENT_ID: '', // ex: '1234567890-abc123.apps.googleusercontent.com'
  API_BASE_URL: 'http://localhost:3000/api',
};
