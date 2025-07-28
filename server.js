const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- ROTAS DA API ---

// ROTA: Listar todos os produtos (GET)
app.get('/api/produtos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA: Adicionar um novo produto (POST)
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

// ----- ROTA DE ATUALIZAÇÃO (PUT) ADICIONADA -----
app.put('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    // Pega todos os campos que podem ser atualizados
    const { nome, imagem_url, preco, quantidade, vendas } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE produtos SET nome = $1, imagem_url = $2, preco = $3, quantidade = $4, vendas = $5 WHERE id = $6 RETURNING *',
            [nome, imagem_url, preco, quantidade, vendas, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ----- ROTA PARA DELETAR (DELETE) ADICIONADA -----
app.delete('/api/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(204).send(); // 204 No Content - sucesso sem corpo de resposta
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});