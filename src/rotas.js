const express = require('express');
const rotas = express();
const middleware = require('./middleware');

//usuarios 
const usuarios = require('./controladores/usuarios');
rotas.post("/usuario", usuarios.cadastrarUsuario);
rotas.post("/login", usuarios.login);

//rotas com filtro
rotas.use(middleware);
rotas.get("/usuario", usuarios.detalharUsuario);
rotas.put("/usuario", usuarios.atualizarUsuario); 

//produtos
const produtos = require('./controladores/produtos');
rotas.post("/produtos", produtos.cadastrarProduto);
rotas.get("/produtos", produtos.obterProdutos);
rotas.get("/produtos/:id", produtos.obterProduto);
rotas.put("/produtos/:id", produtos.atualizarProduto);
rotas.delete("/produtos/:id", produtos.excluirProduto);

module.exports = rotas;
