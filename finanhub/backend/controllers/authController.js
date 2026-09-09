const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { db } = require('../database/db');
const { gerarToken } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });

  const hash = await bcrypt.hash(senha, 10);
  const info = db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)').run(nome, email, hash);
  const usuario = { id: info.lastInsertRowid, nome, email };

  res.status(201).json({ usuario, token: gerarToken(usuario) });
}

async function login(req, res) {
  const { email, senha } = req.body;
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!usuario || !usuario.senha_hash) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  const ok = await bcrypt.compare(senha, usuario.senha_hash);
  if (!ok) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

  res.json({ usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }, token: gerarToken(usuario) });
}

/**
 * Login com Google usando o Google Identity Services (GSI).
 * O frontend usa o botão "Sign in with Google" do Google, que devolve um
 * `credential` (JWT assinado pelo Google) — o back valida esse token diretamente
 * com a biblioteca oficial (google-auth-library), sem precisar de redirecionamento
 * OAuth manual. Isso evita ter que confiar em dados enviados "cruamente" pelo front.
 *
 * Requer GOOGLE_CLIENT_ID configurado no .env (ver README > "Configurar login com Google").
 */
async function loginGoogle(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ erro: 'Token do Google (credential) não enviado.' });
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ erro: 'GOOGLE_CLIENT_ID não configurado no servidor. Veja o README.' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (e) {
    return res.status(401).json({ erro: 'Token do Google inválido.' });
  }

  const { sub: googleId, email, name: nome } = payload;

  let usuario = db.prepare('SELECT * FROM usuarios WHERE google_id = ? OR email = ?').get(googleId, email);
  if (!usuario) {
    const info = db.prepare('INSERT INTO usuarios (nome, email, google_id) VALUES (?, ?, ?)').run(nome || email, email, googleId);
    usuario = { id: info.lastInsertRowid, nome: nome || email, email };
  } else if (!usuario.google_id) {
    // Usuário já existia com e-mail/senha — vincula a conta Google.
    db.prepare('UPDATE usuarios SET google_id = ? WHERE id = ?').run(googleId, usuario.id);
  }

  res.json({ usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }, token: gerarToken(usuario) });
}

module.exports = { cadastrar, login, loginGoogle };
