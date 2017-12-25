const _ = require('lodash');
const userRepo = require('../repos/user');
const messageRepo = require('../repos/message');

const disconnectedSessions = {};

const handleConnect = (io, socket) => {
    const sessionId = socket.handshake.session.id;
    const timeoutId = disconnectedSessions[sessionId];
    if (timeoutId) {
        clearTimeout(timeoutId);
        delete disconnectedSessions[sessionId];
    }
    else {
        let welcome = messageRepo.getMessage('welcome', socket.user);
        const onlineList = userRepo.getOnlineUsers();

        if (onlineList === '') {
            welcome += ' You are the first here.'
        }
        else {
            welcome += ' There are online friends here: ' + onlineList;
        }

        socket.emit('message', messageRepo.createMessage(welcome, {}, true));
        socket.broadcast.emit('message', messageRepo.createMessage(
            messageRepo.getMessage('join', socket.user), {event: 'user:join', user: socket.user.profile.displayName}));
    }

    console.log('Connection opened by %s', socket.user.profile.displayName);
    userRepo.addUserOnline(socket.user, socket.id);

    const messages = messageRepo.getMessages();
    if (messages.length) {
        socket.emit('message', messages);
    }

    socket.on('message', (message, acknowledge) => handleMessage(io, socket, message, acknowledge));
    socket.on('message', (message) => handleTyping(io, socket, message));
    socket.on('disconnect', (reason) => handleDisconnect(io, socket, reason));
};

const handleDisconnect = (io, socket, reason) => {
    const sessionId = socket.handshake.session.id;
    disconnectedSessions[sessionId] = setTimeout(() => {
        delete disconnectedSessions[sessionId];
        io.sockets.emit('message', messageRepo.createMessage(
            messageRepo.getMessage('leave', socket.user), {event: 'user:leave', user: socket.user.profile.displayName}));
    }, 2000);

    console.log('Connection closed by %s with reason: %s', socket.user.login, reason);
    userRepo.removeUserOnline(socket.user, socket.id);
};

const handleMessage = (io, socket, message, acknowledge) => {
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
};

const handleTyping = (io, socket, message, acknowledge) => {
    if (!message || !_.startsWith(message.event, 'typing:')) return;

    socket.broadcast.emit('message', messageRepo.createMessage(
        messageRepo.getMessage('typing', socket.user), {event: message.event, user: socket.user.profile.displayName}));
};

module.exports = (io) => {
    io.on('connection', (socket) => handleConnect(io, socket));
};