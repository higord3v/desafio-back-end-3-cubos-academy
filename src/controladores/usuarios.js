const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const conexao = require('../conexao');
const cs = require('../chave_secreta');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja: loja } = req.body;

    if (!nome ||!email ||!senha ||!loja) {
        return res.status(400).json({
            mensagem: 'Por favor, insira todos campos obrigatórios.'
        });
    }

    try {
        const query = `SELECT * FROM usuarios WHERE email = $1`;
        const { rowCount } = await conexao.query(query, [email]);

        if (rowCount > 0) {
            return res.status(400).json({
                mensagem: 'O email informado já possui cadastro.'
            });
        }
    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível cadastrar o usuário.'
        });
    }

    const hash = await bcrypt.hash(senha, 10);
    const query = 
    `INSERT INTO usuarios (nome, email, senha, nome_loja)
    VALUES($1, $2, $3, $4)`;

    try {
        const { rowCount } = await conexao.query(query, [nome, email, hash, loja]);

    if (rowCount === 0) {
        return res.status(400).json({
            mensagem: 'Não foi possível cadastrar o usuário.'
        });
    }

    return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível cadastrar o usuário.'
        })
    }
}

const login = async (req, res) => {
    const { senha, email } = req.body;
    if (!senha || !email) {
        return res.status(400).json({
            mensagem: 'Por favor insira os campos Obrigatórios'
        });
    }
    try {
        const query = `SELECT * FROM usuarios WHERE email = $1`;
        const { rows, rowCount } = await conexao.query(query, [email]);

        if (rowCount === 0) {
            return res.status(400).json({
                mensagem: 'Email ou senha inválidos'
            });
        }
        const usuario = rows[0];
        const validarSenha = await bcrypt.compare(senha, usuario.senha);

        if (!validarSenha) {
            return res.status(400).json({
                mensagem: "Usuário e/ou senha inválido(s)."
            });
        }

        const token = jwt.sign({
            id: usuario.id
        }, cs, { expiresIn: '1h' });

        return res.status(201).json({
            token
        });

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível entrar.'
        });
    }
}

const detalharUsuario = async (req, res) => {
    const { usuario } = req;
    res.status(200).json({
        usuario: usuario
    })
}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja: loja } = req.body;
    const { id } = req.usuario;
 
    if (!nome ||!email ||!senha ||!loja) {
        return res.status(400).json({
            mensagem: 'Por favor, insira todos campos obrigatórios.'
        });
    }

    try {
        const query = `SELECT * FROM usuarios WHERE id = $1`;
        const { rows, rowCount } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'O usuário não foi encontrado.'
            });
        }
    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o usuário.'
        });
    }

    try {
        const query = `SELECT * FROM usuarios WHERE email = $1`;
        const { rows, rowCount } = await conexao.query(query, [email]);

        if (rowCount > 0 && rows[0].id !== id) {
            return res.status(400).json({
                mensagem: 'Este email já está cadastrado.'
            });
        }
        
    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o usuário.'
        })
    }

    const hash = await bcrypt.hash(senha, 10);
    const query = 
    `UPDATE usuarios
     SET nome = $1,
     email = $2,
     senha = $3,
     nome_loja = $4
     WHERE id = $5`;
    try {
        const { rowCount } = await conexao.query(query, [nome, email, hash, loja, id]);

    if (rowCount === 0) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o usuário.'
        });
    }

    return res.status(204).json();

    } catch (error) {
        return res.status(400).json({
            mensagem: 'Não foi possível atualizar o usuário.'
        })
    }
}

module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
}
