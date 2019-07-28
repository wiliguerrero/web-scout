'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
const cors = require('cors');
const app = express();


require('./database');


app.set('port',process.env.PORT||3000);
//cargar rutas

//middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));



//cors
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

//rutas
app.use('/api',require('./routes/user'));
app.use('/api',require('./routes/fallow'));
app.use('/api',require('./routes/publication'));
app.use('/api',require('./routes/message'));
//exportar

//static files
app.use(express.static(path.join(__dirname,'public/dist')));
app.get('*',function(req,res){
    res.sendfile(path.join(__dirname,'public/dist/index.html'));
});
module.exports = app;