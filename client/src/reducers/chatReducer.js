/**
 * Created by tezhdmi on 06/12/17.
 */
import {createSelector} from 'reselect';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import {ONLINE_STATUS} from '../actions/chatActions';
import * as actions from '../actions/chatActions';
import * as auth from '../actions/authActions';

const initialState = {
    messages: {},
    meTyping: {},
    usersTyping: [],
    usersOnline: [],
    channelStatus: ONLINE_STATUS.OFF,
    serverStatus: ONLINE_STATUS.UNKNOWN,
};

export default (state = initialState, action) => {
    let message = action.message;
    const {messages} = state;

    switch (action.type) {
        case actions.CHANNEL_ON:
            return {...state, channelStatus: ONLINE_STATUS.ON};
        case actions.CHANNEL_OFF:
            return {...state, channelStatus: ONLINE_STATUS.OFF, serverStatus: ONLINE_STATUS.UNKNOWN};
        case actions.SERVER_OFF:
            return {...state, serverStatus: ONLINE_STATUS.OFF};
        case actions.SERVER_ON:
            return {...state, serverStatus: ONLINE_STATUS.ON};


        case actions.PUT_MESSAGE:
            if (action.messages) {
                const newMessages = action.messages
                    .filter(item => messages[item.id] === undefined)
                    .map(item => ({...item, receiveDate: Date.now()}));

                if (newMessages.length) {
                    return {
                        ...state,
                        messages: {
                            ...messages,
                            ...keyBy(newMessages, item => item.id)
                        }
                    }
                }
            }
            else if (messages[message.id] === undefined) {
                message = {...message, receiveDate: Date.now()};
                return {
                    ...state,
                    messages: {
                        ...messages,
                        [message.id]: message
                    }
                };
            }

            return state;

        case actions.SUBMIT_MESSAGE:
            return {
                ...state,
                messages: {
                    ...messages,
                    [message.id]: message
                }
            };

        case actions.ACK_MESSAGE:
            message = {...message, acknowledgeDate: Date.now()};
            return {
                ...state,
                messages: mapValues(messages, item => item.id === message.id ? message : item)
            };


        case actions.ME_START_TYPING:
            return {
                ...state,
                meTyping: {status: true}
            };

        case actions.ME_STOP_TYPING:
            return {
                ...state,
                meTyping: {status: false}
            };

        case actions.USER_START_TYPING:
            return {
                ...state,
                usersTyping: state.usersTyping.concat(action.user)
            };

        case actions.USER_STOP_TYPING:
            return {
                ...state,
                usersTyping: state.usersTyping.filter(user => user !== action.user)
            };

        case actions.USER_JOIN:
            return {
                ...state,
                usersOnline: state.usersOnline.concat(action.user)
            };

        case actions.USER_LEAVE:
            return {
                ...state,
                usersOnline: state.usersOnline.filter(user => user !== action.user)
            };


        case auth.LOGOUT:
            return initialState;

        default:
            return state;
    }
};

// selector to get only first (max) latest tasks
const messageSelector = state => state.chat.messages;
const topMessages = max => messages => {
    const _messages = sortBy(map(messages), item => item.submitDate);
    return max === 0 || _messages.length <= max ? _messages : _messages.slice(_messages.length-max);
};
export const topMessageSelector = max => createSelector(messageSelector, topMessages(max));