const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque-este-segredo-em-producao';

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });
}

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Token não fornecido.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = { autenticar, gerarToken, JWT_SECRET };
