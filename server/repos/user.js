const uuid = require('uuid');
const _ = require('lodash');

let usersByLogin = {};
let usersByToken = {};
let usersOnline = {};

module.exports = {
    getUserByToken: (token) => {
        return usersByToken[token];
    },

    getUserByLogin: (login) => {
        return usersByLogin[login];
    },

    getUserByCredentials: (login, password) => {
        return _.get(usersByLogin, [login, password]);
    },

    addUser: (login, password) => {
        const token = uuid.v4();
        const user = {token, login, profile: {displayName: login}};

        usersByToken[token] = user;
        usersByLogin[login] = {[password]: user};

        return user;
    },

    removeToken: (token) => {
        usersByToken = _.omit(usersByToken, token);
    },

    addUserOnline: (login, socketId) => {
        if (!usersOnline[login]) {
            usersOnline[login] = {[socketId]: login};
        }
        else {
            usersOnline[login][socketId] = login;
        }
    },

    removeUserOnline: (login, socketId) => {
        usersOnline[login] = _.omit(usersOnline[login], socketId);
        if (_.isEmpty(usersOnline[login])) {
            usersOnline = _.omit(usersOnline, login);
        }
    }
};