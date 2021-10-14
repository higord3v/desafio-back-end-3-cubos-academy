const jwt = require('jsonwebtoken');
const cs = require('./chave_secreta');
const conexao = require('./conexao');

const middleware = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            mensagem: 'É necessário autenticar-se para prosseguir.'
        });
    }

    try {
        const token = authorization.replace('Bearer', '').trim();
        const { id } = jwt.verify(token, cs);

        const query = `SELECT * FROM usuarios WHERE id = $1`;
        const { rows, rowCount } = await conexao.query(query, [id]);
    
        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: 'Não foi possível localizar o usuário.'
            })
        }

        const { senha, ...dadosUsuario } = rows[0];
        req.usuario = dadosUsuario;
        next();

    } catch (error) {
        return res.status(401).json({
            mensagem: 'A validação de token falhou.'
        })
    }
    
}

module.exports = middleware;
