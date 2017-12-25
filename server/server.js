const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const logger = require('morgan');
const cors = require('cors');
const config = require('./config');


const app = express();
app.locals.port = config.port;

app.use(express.static(__dirname + '/public'));
if (config.enableLogging) {
    app.use(logger('dev'));
}
if (config.originUrl) {
    app.use(cors({ origin: config.originUrl, credentials: true }));
}

app.use(cookieParser(config.sessionSecretKey));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require('./middlewares/session');
app.use(session);
app.use(require('./controllers/auth'));


const server = http.createServer(app);
const io = socketIO(server, { path: '/chat' });

const sharedSession = require('express-socket.io-session');
io.use(sharedSession(session, { autoSave: true }));
io.use(require('./middlewares/auth'));
require('./middlewares/chat')(io);

server.listen(app.locals.port, () => {
    console.log('Chat server started on port %s', app.locals.port)
});