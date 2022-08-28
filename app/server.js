let express = require('express');
let session = require('express-session');
let path = require('path');
let app = express();
let cors = require('cors');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
require('dotenv').config();
let fs = require('fs');
const { constants } = require('crypto');
let helmet = require("helmet");

app.use(session({
  secret: process.env.SESSION_SECRET_TOKEN,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.DOMAIN }));
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(function (err, req, res, next) {
  res.status(500).send('error occurred.');
});

let isyncController = require('./controllers/ISync');
let accountController = require('./controllers/Account');
let marketController = require('./controllers/Market');
let othersController = require('./controllers/Others');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const HTML_FILE = path.join(PUBLIC_DIR, 'index.html');
const NOT_FOUND_TEMPLATE = path.resolve(__dirname, './template/404.html');

app.listen(process.env.PORT, process.env.HOST, (req, res) => {
  console.log('Server is running on ' + process.env.HOST + ':' + process.env.PORT);
});

// https.createServer({
//   key: fs.readFileSync('/usr/local/ssl/certificate/private.key'),
//   cert: fs.readFileSync('/usr/local/ssl/certificate/iSync.bsc.com.vn.crt'),
//   ca: fs.readFileSync('/usr/local/ssl/certificate/ca-bundle.crt'),
//   secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
//   ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384",
//   honorCipherOrder: true
// }, app).listen(process.env.PORT, function(){
// console.log('Server is running on ' + process.env.HOST + ':' + process.env.PORT);
// });
// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(301, { "Location": process.env.DOMAIN });
//   res.end();
// }).listen(80);

app.use(express.static(PUBLIC_DIR));


app.get('/', (req, res) => {
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.sendFile(HTML_FILE);
});

app.use('/isync', isyncController);
app.use('/accounts', accountController.router);
app.use('/', marketController);
app.use('/', othersController);

app.get('*', (req, res) => {
  res.sendFile(NOT_FOUND_TEMPLATE);
});