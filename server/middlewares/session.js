const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const config = require('../config');

const expressSession = session({
    secret: config.sessionSecretKey,
    saveUninitialized: true,
    resave: false,
    cookie: {
        httpOnly: false,
        secure: false
    },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
});

module.exports = expressSession;