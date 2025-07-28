// Importa os pacotes que instalamos
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Cria a aplicação Express
const app = express();
const port = process.env.PORT || 8080; // Usa a porta do ambiente ou 8080

// Configurações do App
app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Configuração da Conexão com o Banco de Dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Pega a URL de conexão do ambiente
  ssl: {
    rejectUnauthorized: false // Necessário para conexões com Heroku/Fly.io
  }
});

// --- ROTAS DA API ---

// ROTA 1: Listar todos os produtos (GET /api/produtos)
app.get('/api/produtos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA 2: Adicionar um novo produto (POST /api/produtos)
app.post('/api/produtos', async (req, res) => {
  const { nome, imagemUrl, preco, quantidade, vendas } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO produtos (nome, imagem_url, preco, quantidade, vendas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, imagemUrl, preco, quantidade, vendas || 0]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA 3: Atualizar a quantidade de um produto (PUT /api/produtos/:id)
app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, imagemUrl, preco, quantidade, vendas } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE produtos SET nome = $1, imagem_url = $2, preco = $3, quantidade = $4, vendas = $5 WHERE id = $6 RETURNING *',
            [nome, imagemUrl, preco, quantidade, vendas, id]
        );
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ROTA 4: Deletar um produto (DELETE /api/produtos/:id)
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    res.status(204).send(); // 204 No Content - sucesso sem corpo de resposta
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicia o servidor para escutar na porta definida
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});