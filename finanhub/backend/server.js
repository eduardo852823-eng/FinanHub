require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { init } = require('./database/db');

const authRoutes = require('./routes/auth');
const instituicoesRoutes = require('./routes/instituicoes');
const transacoesRoutes = require('./routes/transacoes');
const categoriasRoutes = require('./routes/categorias');
const relatoriosRoutes = require('./routes/relatorios');
const demoRoutes = require('./routes/demo');

init(); // cria tabelas e dados padrão (instituições, categorias) se ainda não existirem

const app = express();
app.use(cors());
app.use(express.json());

// Frontend estático (para rodar tudo com um único processo em desenvolvimento)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API REST
app.use('/api/auth', authRoutes);
app.use('/api/instituicoes', instituicoesRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/demo', demoRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FinanHub backend rodando em http://localhost:${PORT}`));
