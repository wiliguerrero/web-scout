'use strict'

var express = require('express');
var MessageController = require('../controllers/foto');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/get-foto/:id', MessageController.getFoto);
api.get('/get-fotos-user/:id', MessageController.getFotosUser);
api.post('/foto/:id', MessageController.saveFoto);
api.delete('/delete-foto/:id', MessageController.deletePublication);
//api.delete('/foto/:id', md_auth.ensureAuth, MessageController.getEmmitMessages);


module.exports = api;