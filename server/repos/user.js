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
        delete usersByToken[token];
    },

    getOnlineUsers: () => {
        let onlineList = '';

        _.forEach(usersOnline, user => onlineList += ', ' + Object.values(user)[0]);
        if (onlineList !== '') {
            onlineList = onlineList.substr(2);
        }

        return onlineList;
    },

    addUserOnline: (user, socketId) => {
        if (!usersOnline[user.login]) {
            usersOnline[user.login] = {[socketId]: user.profile.displayName};
        }
        else {
            usersOnline[user.login][socketId] = user.profile.displayName;
        }
    },

    removeUserOnline: (user, socketId) => {
        delete usersOnline[user.login][socketId];
        if (_.isEmpty(usersOnline[user.login])) {
            delete usersOnline[user.login];
        }
    }
};