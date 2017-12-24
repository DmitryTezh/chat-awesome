const userRepo = require('../repos/user');

module.exports = (socket, next) => {
    let user = socket.handshake.session.user;
    const token = socket.handshake.query.token;

    if (!user && token) {
        user = userRepo.getUserByToken(token);
        socket.handshake.session.user = user;
    }

    if (user) {
        socket.user = user;
        return next();
    }
    else {
        return next(new Error('Unauthorized')); // Unauthorized
    }
};