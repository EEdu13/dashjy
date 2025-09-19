const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve arquivos estáticos (HTML, CSS, JS)

// Configuração do PostgreSQL
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
});

// Teste de conexão
pool.connect((err, client, release) => {
    if (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conectado ao PostgreSQL Railway com sucesso!');
        release();
    }
});

// Rota para buscar todas as avaliações
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const { fazenda, talhao } = req.query;
        
        let query = `SELECT * FROM ${process.env.DB_SCHEMA}.${process.env.DB_TABLE}`;
        let params = [];
        let whereConditions = [];
        
        if (fazenda) {
            whereConditions.push('fazenda = $' + (params.length + 1));
            params.push(fazenda);
        }
        
        if (talhao) {
            whereConditions.push('talhao = $' + (params.length + 1));
            params.push(talhao);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ' ORDER BY data_avaliacao DESC';
        
        const result = await pool.query(query, params);
        
        // Processar os dados para calcular totais e percentuais
        const avaliacoes = result.rows.map(row => {
            const camposFalhas = [
                'quebradas', 'formigas', 'pisoteadas', 'sem_plantar', 'coleto_afogado',
                'substrato_exposto', 'queima_adubo', 'raiz_paralisada', 'canela_preta',
                'gafanhotos', 'escaldadura', 'outros', 'ausencia_de_cova', 'erosao',
                'pragas', 'quebradas_vivas', 'tombadas_vivas', 'escaldadura_vivas',
                'falsa_subsolagem_toco', 'queimada_viva', 'raspagem_grilo_2_nivel'
            ];
            
            const totalFalhas = camposFalhas.reduce((total, campo) => {
                return total + (parseInt(row[campo]) || 0);
            }, 0);
            
            const percentualFalhas = row.mudas_avaliadas > 0 
                ? ((totalFalhas / row.mudas_avaliadas) * 100).toFixed(2)
                : 0;
            
            // Garantir formato correto das datas
            const formatarDataParaFrontend = (data) => {
                if (!data) return null;
                if (data instanceof Date) {
                    return data.toISOString().split('T')[0]; // YYYY-MM-DD
                }
                if (typeof data === 'string') {
                    // Se já está no formato correto, retornar
                    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                        return data;
                    }
                    // Tentar converter outros formatos
                    const dataObj = new Date(data);
                    if (!isNaN(dataObj.getTime())) {
                        return dataObj.toISOString().split('T')[0];
                    }
                }
                return data; // Retornar como está se não conseguir converter
            };
            
            return {
                ...row,
                data_avaliacao: formatarDataParaFrontend(row.data_avaliacao),
                data_plantio: formatarDataParaFrontend(row.data_plantio),
                totalFalhas,
                percentualFalhas: parseFloat(percentualFalhas)
            };
        });
        
        res.json(avaliacoes);
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar fazendas únicas
app.get('/api/fazendas', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT fazenda FROM ${process.env.DB_SCHEMA}.${process.env.DB_TABLE} 
             WHERE fazenda IS NOT NULL 
             ORDER BY fazenda`
        );
        
        const fazendas = result.rows.map(row => row.fazenda);
        res.json(fazendas);
    } catch (error) {
        console.error('Erro ao buscar fazendas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar talhões únicos
app.get('/api/talhoes', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT talhao FROM ${process.env.DB_SCHEMA}.${process.env.DB_TABLE} 
             WHERE talhao IS NOT NULL 
             ORDER BY talhao`
        );
        
        const talhoes = result.rows.map(row => row.talhao);
        res.json(talhoes);
    } catch (error) {
        console.error('Erro ao buscar talhões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para atualizar uma avaliação
app.put('/api/avaliacoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Construir query de update dinamicamente
        const setClause = [];
        const values = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            setClause.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
        
        if (setClause.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }
        
        values.push(id); // ID para o WHERE
        
        const query = `
            UPDATE ${process.env.DB_SCHEMA}.${process.env.DB_TABLE} 
            SET ${setClause.join(', ')} 
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }
        
        res.json({ 
            message: 'Avaliação atualizada com sucesso',
            avaliacao: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para salvar múltiplas alterações
app.post('/api/avaliacoes/bulk-update', async (req, res) => {
    try {
        const updates = req.body; // { avaliacaoId: { campo: valor, ... }, ... }
        const results = [];
        
        for (const [avaliacaoId, campos] of Object.entries(updates)) {
            const setClause = [];
            const values = [];
            let paramIndex = 1;
            
            for (const [key, value] of Object.entries(campos)) {
                setClause.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
            
            if (setClause.length > 0) {
                values.push(avaliacaoId);
                
                const query = `
                    UPDATE ${process.env.DB_SCHEMA}.${process.env.DB_TABLE} 
                    SET ${setClause.join(', ')} 
                    WHERE id = $${paramIndex}
                    RETURNING id
                `;
                
                const result = await pool.query(query, values);
                results.push({ id: avaliacaoId, updated: result.rows.length > 0 });
            }
        }
        
        res.json({ 
            message: 'Alterações salvas com sucesso',
            results 
        });
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para servir o dashboard
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(port, process.env.HOST, () => {
    console.log(`🚀 Servidor rodando em http://${process.env.HOST}:${port}`);
    console.log(`📊 Dashboard disponível em http://${process.env.HOST}:${port}`);
    console.log(`🔧 API disponível em http://${process.env.HOST}:${port}/api`);
});

module.exports = app;