const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const logger = require('morgan');
const cors = require('cors');


const app = express();
app.locals.port = 5000;

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(cookieParser('chatserversecretkey'));
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