/**
 * Created by tezhdmi on 06/12/17.
 */
import io from 'socket.io-client';
import {eventChannel, delay, buffers} from 'redux-saga';
import {take, put, call, select, fork, spawn} from 'redux-saga/effects';
import {race, cancelled, actionChannel, takeLatest} from 'redux-saga/effects';
import isArray from 'lodash/isArray';
import * as actions from '../actions/chatActions';
import * as auth from '../actions/authActions';

const MAX_MSG_QUEUE_SIZE = 30;
const USER_TYPING_TIMEOUT = 1000;
const socketServerURL = 'http://localhost:5000';

// wrapping functions for socket events (connect, disconnect, reconnect, emit)
const init = (token) => {
    return io(socketServerURL, {path: '/chat', autoConnect: false, query: {token}});
};

const connect = socket => {
    return new Promise(resolve => {
        socket.once('connect', () => resolve(socket));
        socket.io.reconnection(true);
        socket.open();
    });
};

const disconnect = socket => {
    return new Promise(resolve => {
        socket.once('disconnect', () => resolve(socket));
    });
};

const reconnect = socket => {
    return new Promise(resolve => {
        socket.once('reconnect', () => resolve(socket));
    });
};

const deliverMessage = (socket, message) => {
    return new Promise(resolve => {
        if (!socket) {
            resolve(false);
        }
        socket.emit('message', message, () => resolve(true));
    });
};

const sendTyping = (socket, message) => {
    return new Promise(resolve => {
        if (!socket) {
            resolve(false);
        }
        socket.emit('message', message);
        resolve(true);
    });
};


// This is how channel is created
const createSocketChannel = socket => eventChannel(emit => {
    const handler = message => emit(message);
    socket.on('message', handler);
    return () => socket.off('message', handler);
});

// connection monitoring sagas
const listenConnectSaga = function* (socket) {
    while (true) {
        yield call(connect, socket);
        yield put({type: actions.SERVER_ON});
    }
};

const listenDisconnectSaga = function* (socket) {
    while (true) {
        yield call(disconnect, socket);
        yield put({type: actions.SERVER_OFF});
    }
};

const listenReconnectSaga = function* (socket) {
    while (true) {
        yield call(reconnect, socket);
        yield put({type: actions.SERVER_ON});
    }
};


// User typing sagas
const executeUserTypingSaga = function* (socket) {
    const {status} = yield select(state => state.chat.meTyping);
    if (!status) {
        yield put({type: actions.ME_START_TYPING});
        yield spawn(sendTyping, socket, {event: 'typing:start'});
    }

    yield call(delay, USER_TYPING_TIMEOUT);
    yield call(cancelUserTypingSaga, socket, spawn);
};

const cancelUserTypingSaga = function* (socket, run = call) {
    const {status} = yield select(state => state.chat.meTyping);
    if (status) {
        yield put({type: actions.ME_STOP_TYPING});
        yield run(sendTyping, socket, {event: 'typing:stop'});
    }
};

const listenUserTypingSaga = function* (socket) {
    yield take(actions.SERVER_ON);
    yield takeLatest(actions.SUBMIT_TYPING, executeUserTypingSaga, socket);
};


// Saga to listen incoming channel.
let thisSocket;
const listenIncomingMessagesSaga = function* () {
    try {
        const {token} = yield select(state => state.auth);
        const socket = init(token);
        thisSocket = socket;

        const socketChannel = yield call(createSocketChannel, socket);
        yield put({type: actions.CHANNEL_ON});

        yield fork(listenConnectSaga, socket);
        yield fork(listenDisconnectSaga, socket);
        yield fork(listenReconnectSaga, socket);
        yield fork(listenUserTypingSaga, socket);

        while (true) {
            const message = yield take(socketChannel);

            if (['typing:start', 'typing:stop', 'user:leave'].includes(message.event)) {
                yield put({
                    type: message.event === 'typing:start' ? actions.USER_START_TYPING : actions.USER_STOP_TYPING,
                    user: message.user,
                    message: message.body
                });
            }

            if (['user:join', 'user:leave'].includes(message.event)) {
                yield put({
                    type: message.event === 'user:join' ? actions.USER_JOIN : actions.USER_LEAVE,
                    user: message.user,
                    message: message.body
                });
            }

            if (!['typing:start', 'typing:stop'].includes(message.event)) {
                yield put({
                    type: actions.USER_STOP_TYPING,
                    user: message.sender,
                    message: message.body
                });
                yield put({
                    type: actions.PUT_MESSAGE,
                    message: isArray(message) ? undefined : message,
                    messages: isArray(message) ? message : undefined
                });
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        if (yield cancelled()) {
            if (thisSocket) {
                //yield call(cancelUserTypingSaga, thisSocket);

                thisSocket.disconnect(true);
                thisSocket = null;

                yield put({type: actions.SERVER_OFF});
            }
            yield put({type: actions.CHANNEL_OFF});
        }
    }
};

// Saga to listen outgoing channel.
const listenOutgoingMessagesSaga = function* () {
    const outgoingMessageChannel = yield actionChannel(actions.SUBMIT_MESSAGE, buffers.sliding(MAX_MSG_QUEUE_SIZE));
    yield take(actions.SERVER_ON);

    while (true) {
        const {message} = yield take(outgoingMessageChannel);

        while (true) {
            //yield call(cancelUserTypingSaga, thisSocket);

            const {acknowledged} = yield race({
                acknowledged: call(deliverMessage, thisSocket, message),
                cancel: take(actions.SERVER_OFF),
                timeout: delay(2000)
            });

            if (!acknowledged) {
                yield take(actions.SERVER_ON);
            }
            else {
                yield put({type: actions.ACK_MESSAGE, message: message});
                break;
            }
        }
    }
};

// Root saga to listen incoming and outgoing channels and user actions
export default function* chatSaga() {
    yield fork(listenOutgoingMessagesSaga);

    while (true) {
        yield take(actions.START_CHANNEL);
        yield race({
            task: call(listenIncomingMessagesSaga),
            cancel: take([actions.STOP_CHANNEL, auth.LOGOUT])
        });
    }
};