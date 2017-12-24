const router = require('express').Router();
const _ = require('lodash');
const userRepo = require('../repos/user');

router.post('/auth', (req, res, next) => {
    if (!req.session) return next('Session middleware is not setup');

    let user;
    const authorization = req.get('Authorization');

    if (_.startsWith(authorization, 'Bearer')) {
        const words = _.split(authorization, ' ');

        if (words.length) {
            user = userRepo.getUserByToken(words[1]);
        }
    }
    else if (_.startsWith(authorization, 'Basic')) {
        const login = req.body.login;
        const password = req.body.password;

        if (login && password) {
            if (userRepo.getUserByLogin(login)) {
                user = userRepo.getUserByCredentials(login, password);
            }
            else {
                user = userRepo.addUser(login, password);
            }
        }
    }

    if (user) {
        req.session.user = user;
        res.json(user);
    }
    else {
        res.sendStatus(401); // Unauthorized
    }
});

router.post('/logout', (req, res) => {
    if (req.session && req.session.user) {
        const user = req.session.user;
        userRepo.removeToken(user.token);
        req.session.destroy(() => {});
    }

    res.sendStatus(200);
});

module.exports = router;