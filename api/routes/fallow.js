'use strict'

var express = require('express');
var FallowController = require('../controllers/fallow');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/fallow',md_auth.ensureAuth,FallowController.saveFallow);
api.delete('/fallow/:id',md_auth.ensureAuth,FallowController.deleteFallow);
api.get('/fallowing/:id?/:page?',md_auth.ensureAuth,FallowController.getFallowingUser);
api.get('/fallowed/:id?/:page?',md_auth.ensureAuth,FallowController.getFallowedUsers);
api.get('/get-my-fallows/:fallowed?',md_auth.ensureAuth,FallowController.getMyFallows);
module.exports= api
