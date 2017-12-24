const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const logger = require('morgan');
const cors = require('cors');
const _ = require('lodash');
const userRepo = require('./repos/user');
const messageRepo = require('./repos/message');


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


io.on('connection', (socket) => {
    console.log('Connection opened by %s', socket.user.profile.displayName);
    userRepo.addUserOnline(socket.user.login, socket.id);

    socket.emit('message', messageRepo.createMessage(messageRepo.getMessage('welcome', socket.user), {}, true));
    socket.broadcast.emit('message', messageRepo.createMessage(
        messageRepo.getMessage('join', socket.user), {event: 'user:join', user: socket.user.profile.displayName}));

    const messages = messageRepo.getMessages();
    if (messages.length) {
        socket.emit('message', messages);
    }

    socket.on('message', (message, acknowledge) => {
        if (!message || !message.body || message.event !== 'message') return;

        if (acknowledge) {
            acknowledge();
        }

        if (_.startsWith(_.toLower(message.body), 'bot:')) {
            const reply = messageRepo.getReplyMessage(message, socket.user);

            let closeSocketOnGoodbye = null;
            if (reply === messageRepo.getMessage('goodbye', socket.user)) {
                closeSocketOnGoodbye = () => socket.close();
            }

            socket.emit('message', messageRepo.createMessage(reply), closeSocketOnGoodbye);
        }
        else {
            socket.broadcast.emit('message', message);
            messageRepo.addMessage(message, socket.user);
        }
    });

    socket.on('message', (message) => {
        if (!message || !_.startsWith(message.event, 'typing:')) return;

        socket.broadcast.emit('message', messageRepo.createMessage(
            messageRepo.getMessage('typing', socket.user), {event: message.event, user: socket.user.profile.displayName}));
    });

    socket.on('disconnect', (reason) => {
        console.log('Connection closed by %s with reason: %s', socket.user.login, reason);
        userRepo.removeUserOnline(socket.user.login, socket.id);

        socket.broadcast.emit('message', messageRepo.createMessage(
            messageRepo.getMessage('leave', socket.user), {event: 'user:leave', user: socket.user.profile.displayName}));
    });
});

server.listen(app.locals.port, () => {
    console.log('Chat server started on port %s', app.locals.port)
});