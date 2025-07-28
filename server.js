const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Configurações do App
app.use(cors());
app.use(express.json());

// ----- ESTA É A LINHA QUE FALTAVA -----
// Ela diz ao servidor para mostrar os arquivos da pasta 'public' (seu site)
app.use(express.static('public'));
// -------------------------------------

// Configuração da Conexão com o Banco de Dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ROTA: Listar todos os produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA: Adicionar um novo produto
app.post('/api/produtos', async (req, res) => {
  const { nome, imagemUrl, preco, quantidade } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO produtos (nome, imagem_url, preco, quantidade, vendas) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [nome, imagemUrl, preco, quantidade]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});