/**
 * Created by tezhdmi on 06/12/17.
 */
import uuid from 'uuid';

export const ONLINE_STATUS = {
    ON: 'ON',
    OFF: 'OFF',
    UNKNOWN: 'UNKNOWN'
};

export const START_CHANNEL = 'START_CHANNEL';
export const STOP_CHANNEL = 'STOP_CHANNEL';
export const SUBMIT_MESSAGE = 'SUBMIT_MESSAGE';
export const SUBMIT_TYPING = 'SUBMIT_TYPING';

export const ME_START_TYPING = 'ME_START_TYPING';
export const ME_STOP_TYPING = 'ME_STOP_TYPING';
export const USER_START_TYPING = 'USER_START_TYPING';
export const USER_STOP_TYPING = 'USER_STOP_TYPING';

export const USER_JOIN = 'USER_JOIN';
export const USER_LEAVE = 'USER_LEAVE';

export const PUT_MESSAGE = 'PUT_MESSAGE';
export const ACK_MESSAGE = 'ACK_MESSAGE';

export const CHANNEL_ON = 'CHANNEL_ON';
export const CHANNEL_OFF = 'CHANNEL_OFF';
export const SERVER_ON = 'SERVER_ON';
export const SERVER_OFF = 'SERVER_OFF';

export const createMessage = (sender, body, props = {}) => ({
    id: uuid.v1(),
    sender,
    body,
    ...props,
    submitDate: Date.now()
});

export const startChannel = () => ({type: START_CHANNEL});
export const stopChannel = () => ({type: STOP_CHANNEL});

export const submitMessage = (sender, body) => ({type: SUBMIT_MESSAGE, message: createMessage(sender, body, {event: 'message'})});
export const submitTyping = () => ({type: SUBMIT_TYPING});