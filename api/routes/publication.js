'use strict'

var express = require('express');
var PublicartionController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart=require('connect-multiparty');
var md_upload = multipart({uploadDir: './upload/publications'});

api.get('/probando-pub', md_auth.ensureAuth, PublicartionController.probando);
api.post('/publication', md_auth.ensureAuth, PublicartionController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicartionController.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicartionController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicartionController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth,md_upload], PublicartionController.uploadImage);
api.get('/get-image-pub/:imageFile',PublicartionController.getImageFile);

module.exports = api;