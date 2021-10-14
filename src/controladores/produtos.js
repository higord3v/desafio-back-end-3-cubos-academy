const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const conexao = require('../conexao');
const cs = require('../chave_secreta');

const cadastrarProduto = async (req, res) => {
    const { id } = req.usuario;
    const { nome, quantidade, preco, descricao, categoria, imagem } = req.body;

    if (!nome ||!quantidade ||!preco ||!descricao) {
        return res.status(400).json({
            mensagem: 'Insira ao menos todos campos obrigatórios.'
        })
    }

    if (quantidade < 1) {
        return res.status(400).json({
            mensagem: 'Insira uma quantidade válida.'
        })
    }
    try {
        const query =
         `INSERT INTO produtos (nome, quantidade, preco, descricao, categoria, imagem, usuario_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const { rowCount } = await conexao.query(query, [nome, quantidade, preco, descricao, categoria, imagem, id]);

        if (rowCount === 0) {
            return res.status(400).json({
                mensagem: 'Não foi possível cadastrar o produto.'
            })
        }
        return res.status(201).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Falha no processo de cadastro.'
        });
    }
}

const obterProdutos = async (req, res) => {
    const { id } = req.usuario;
    const { categoria } = req.query;

    if (categoria) {
        try {
            const query = `SELECT * FROM produtos WHERE usuario_id = $1 AND UPPER(categoria) = $2`;
            const { rowCount, rows } = await conexao.query(query, [id, categoria.toUpperCase()]);
    
            if (rowCount === 0) {
                return res.status(404).json({
                    mensagem: 'Não existem produtos para este usuário nesta categoria.'
                });
            }
    
            return res.status(200).json({
                produtos: rows
            })
        } catch (error) {
            return res.status(400).json({
                mensagem: 'Não foi possível obter os produtos.'
            });
        }
    }

    try {
        const query = `SELECT * FROM produtos WHERE usuario_id = $1`;
        const { rowCount, rows } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Não existem produtos para este usuário.'
            });
        }

        return res.status(200).json({
            produtos: rows
        })
    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível obter os produtos.'
        });
    }
}

const obterProduto = async (req, res) => {
    const { id } = req.usuario;
    const { id: produto_id } = req.params;

    try {
        const query = `SELECT * FROM produtos WHERE id = $1`;
        const { rowCount, rows } = await conexao.query(query, [produto_id]);

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'O produto buscado não existe.'
            });
        }

        if (rows[0].usuario_id !== id) {
            return res.status(403).json({
                mensagem: 'Este usuário não tem acesso ao produto.'
            });
        }

        return res.status(200).json({
            produto: rows[0]
        })
    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível obter o produto.'
        });
    }
}

const atualizarProduto = async (req, res) => {
    const { id } = req.params;
    const { id: usuario_id } = req.usuario;
    const { nome, quantidade, preco, descricao, categoria, imagem } = req.body;

    if (!nome ||!quantidade ||!preco ||!descricao) {
        return res.status(400).json({
            mensagem: 'Insira ao menos todos campos obrigatórios.'
        })
    }

    if (quantidade < 1) {
        return res.status(400).json({
            mensagem: 'Insira uma quantidade válida.'
        })
    }
    try {
        const query = `SELECT * FROM produtos WHERE id = $1`;
        const { rowCount, rows } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'O produto buscado não existe.'
            });
        }

        if (rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({
                mensagem: 'Este usuário não tem acesso ao produto.'
            });
        }

        } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi atualizar o produto.'
        });
    }

    let query = '';
    if (categoria && imagem) {
            query = 
        `UPDATE produtos SET nome = $1,
        preco = $2,
        quantidade = $3,
        descricao = $4,
        categoria = $5,
        imagem = $6
        WHERE id = $7`

        try {
        const { rowCount } = await conexao.query(query, [nome, preco, quantidade, descricao, categoria, imagem, id]);
        if (rowCount === 0) {
            return res.status(400).json({
                mensagem: 'Não foi possível atualizar o produto'
            })
        }
    
        return res.status(204).json();

        } catch (error) {
            return res.status(400).json({
                mensagem: 'Não foi possível atualizar o produto'
            })
        }        
    }
    if (!categoria && !imagem) {
        query = 
    `UPDATE produtos SET nome = $1,
    preco = $2,
    quantidade = $3,
    descricao = $4
    WHERE id = $5`

    try {
    const { rowCount } = await conexao.query(query, [nome, preco, quantidade, descricao, id]);
    if (rowCount === 0) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }

    return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }        
}
    if (!imagem) {
        query = 
    `UPDATE produtos SET nome = $1,
    preco = $2,
    quantidade = $3,
    descricao = $4,
    categoria = $5
    WHERE id = $6`

    try {
    const { rowCount } = await conexao.query(query, [nome, preco, quantidade, descricao, categoria, id]);
    if (rowCount === 0) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }

    return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }        
    }
    if (!categoria) {
        query = 
    `UPDATE produtos SET nome = $1,
    preco = $2,
    quantidade = $3,
    descricao = $4,
    imagem = $5
    WHERE id = $6`

    try {
    const { rowCount } = await conexao.query(query, [nome, preco, quantidade, descricao, imagem, id]);
    if (rowCount === 0) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }

    return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o produto'
        })
    }        
    }

}

const excluirProduto = async (req, res) => {
    const { id } = req.params;
    const { id: usuario_id } = req.usuario;
    try {
        const query = `SELECT * FROM produtos WHERE id = $1`;
        const { rowCount, rows } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'O produto buscado não existe.'
            });
        }

        if (rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({
                mensagem: 'Este usuário não tem acesso ao produto.'
            });
        }

        } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi excluir o produto.'
        });
    }

    try {
        const query = `DELETE FROM produtos WHERE id = $1`;
        const { rowCount } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(400).json({
                mensagem: 'Não foi possível excluir o produto.'
            })
        }

        return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível excluir o produto.'
        })
    }
}

module.exports = {
    cadastrarProduto,
    obterProdutos,
    obterProduto,
    atualizarProduto,
    excluirProduto
}
