const express = require('express');
const api = express.Router();
var md_auth = require('../middlewares/authenticated');
var employee = require('../controllers/solicitarInsignia.controller');

api.get('/insignias',md_auth.ensureAuth, employee.getEmployees);
api.post('/agregar', md_auth.ensureAuth,employee.createEmployee);
api.get('/inignia/:id',md_auth.ensureAuth, employee.getEmployee);
api.put('/actualizar/:id', md_auth.ensureAuth,employee.editEmployee);
api.delete('/eliminar/:id',md_auth.ensureAuth, employee.deleteEmployee);
api.get('/mostrarInsignias',md_auth.ensureAuth, employee.getSolicitudesJ);

module.exports = api;