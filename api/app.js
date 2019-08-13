'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const app = express();


require('./database');


app.set('port',process.env.PORT||3800);
//cargar rutas

//middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'public/uploads'),
  filename: (req, file, cb) => {
      cb(null, new Date().getTime() + path.extname(file.originalname));
  }
});
app.use(multer({ storage }).single('image'));

const extendTimeoutMiddleware = (req, res, next) => {
    const space = ' ';
    let isFinished = false;
    let isDataSent = false;
  
    // Only extend the timeout for API requests
    if (!req.url.includes('/api')) {
      next();
      return;
    }
  
    res.once('finish', () => {
      isFinished = true;
    });
  
    res.once('end', () => {
      isFinished = true;
    });
  
    res.once('close', () => {
      isFinished = true;
    });
  
    res.on('data', (data) => {
      // Look for something other than our blank space to indicate that real
      // data is now being sent back to the client.
      if (data !== space) {
        isDataSent = true;
      }
    });
  
    const waitAndSend = () => {
      setTimeout(() => {
        // If the response hasn't finished and hasn't sent any data back....
        if (!isFinished && !isDataSent) {
          // Need to write the status code/headers if they haven't been sent yet.
          if (!res.headersSent) {
            res.writeHead(202);
          }
  
          res.write(space);
  
          // Wait another 15 seconds
          waitAndSend();
        }
      }, 15000);
    };
  
    waitAndSend();
    next();
  };



//cors
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});
app.use(extendTimeoutMiddleware);
//rutas
app.use('/api',require('./routes/user'));
app.use('/api',require('./routes/follow'));
app.use('/api',require('./routes/publication'));
app.use('/api',require('./routes/message'));
app.use('/api',require('./routes/solicitarInsignia.routes'));
app.use('/api',require('./routes/foto'));
//exportar

//static files
app.use(express.static(path.join(__dirname,'public/dist')));
app.get('*',function(req,res){
    res.sendfile(path.join(__dirname,'public/dist/index.html'));
});
module.exports = app;