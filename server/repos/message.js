const uuid = require('uuid');
const _ = require('lodash');

let messages = [];

const replacements = [
    {find: 'bot:', replace: ''},
    {find: ' the ', replace: ''},
    {find: ' a ', replace: ''},
    {find: ' an ', replace: ''},
    {find: '\'s ', replace: 'is'},
    {find: '\'re ', replace: 'are'},
    {find: /[!?.,]/, replace: ''},
    {find: /\s/g, replace: ''},
];

const replies = {
    'hi': 'Hi!',
    'howareyou': 'Thank you, I am fine',
    'whoareyou': 'I am a bot',
    'whatisyourname': 'My name is Koa',
    'canyouhelpme': 'Sure',
    'whatistime': () => Date.now(),

    welcome: 'Hi %s! Welcome to Chat Awesome!',
    join: '%s has joined chat',
    leave: '%s has left chat',
    goodbye: 'See you soon, %s!',
    english: 'Sorry %s, I can speak only English :(',
    typing: '%s is typing',

    default: 'Sorry %s, I don\'t understand your question :( pls ask me something else...'
};

function formatMessage(message) {
    let result = _.toLower(message);

    _.forEach(replacements, replacement => {
        result = _.replace(result, replacement.find, replacement.replace)
    });

    return result;
}

module.exports = {
    getMessages: () => {
        return messages;
    },

    getMessage: (template, user) => {
        return replies[template].replace('%s', user.profile.displayName)
    },

    getReplyMessage: (message, user) => {
        const question = formatMessage(message.body);
        let reply = replies[question];

        if (!/[a-z]/.test(question)) {
            reply = replies.english;
        }
        else if (typeof reply === 'function') {
            reply = reply();
        }

        return (reply || replies.default).replace('%s', user.profile.displayName);
    },

    createMessage: (body, props = {}, temp = false) => {
        return {
            id: !temp ? uuid.v1() : 0,
            sender: 'bot',
            body,
            submitDate: Date.now(),
            event: 'message',
            ...props,
        }
    },

    addMessage: (message, user) => {
        messages.push({...message, sender: user.profile.displayName, submitDate: Date.now()});
        if (messages.length > 100) {
            messages = _.drop(messages, messages.length - 100);
        }
    }
};