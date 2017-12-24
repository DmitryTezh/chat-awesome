/**
 * Created by tezhdmi on 06/12/17.
 */
import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
import authReducer from './authReducer';
import chatReducer from './chatReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    chat: chatReducer,
    form: formReducer
});

export default rootReducer;