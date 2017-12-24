/**
 * Created by tezhdmi on 06/12/17.
 */
import {take, put, call, fork, cancel, cancelled} from 'redux-saga/effects';
import * as actions from '../actions/authActions';
import axios from 'axios';
import queryString from 'querystring';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

const authUserWithToken = function* (token) {
    const response = yield axios.post('/auth',
        {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
    return {
        token,
        profile: response.data.profile
    };
};

const authUserWithCredentials = function* (credentials) {
    const response = yield axios.post('/auth',
        queryString.stringify(credentials), {
            headers: {
                'Authorization': 'Basic',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    
    return {
        token: response.data.token,
        profile: response.data.profile
    };
};

const extractToken = function* () {
    const token = window.localStorage && window.localStorage.getItem('token');
    if (token) {
        yield put({type: actions.LOGON, token});
    }
    else {
        yield put({type: actions.LOGON_CLEAR});
    }
};

const saveProfile = function* (profile) {
    yield put({type: actions.LOGON_SUCCESS, profile});
    if (window.localStorage) {
        window.localStorage.setItem('token', profile.token);
    }
};

const clearProfile = function* () {
    if (window.localStorage) {
        window.localStorage.removeItem('token');
    }
    yield put({type: actions.LOGON_CLEAR});
};

function* logonSaga(token, credentials) {
    try {
        let profile;
        if (token) {
            profile = yield call(authUserWithToken, token);
        }
        else if (credentials) {
            yield put({type: actions.LOGON_REQUEST});
            profile = yield call(authUserWithCredentials, credentials);
        }
        else {
            return yield put({type: actions.LOGON_ERROR, error: 'Logon failed'});
        }

        yield call(saveProfile, profile);
    }
    catch (error) {
        if (token) {
            yield call(clearProfile);
            yield put({type: actions.LOGON_ERROR});
        }
        else if (credentials) {
            yield put({type: actions.LOGON_ERROR, error: error.message});
        }
    }
    finally {
        if (yield cancelled()) {

        }
    }
}

function* logoutSaga() {
    yield axios.post('/logout');
    yield call(clearProfile);
}

export default function* authSaga() {
    yield fork(extractToken);

    while (true) {
        const {token, credentials} = yield take(actions.LOGON);

        const task = yield fork(logonSaga, token, credentials);
        const action = yield take([actions.LOGOUT, actions.LOGON_ERROR]);

        if (action.type === actions.LOGOUT) {
            yield cancel(task);
            yield call(logoutSaga)
        }
    }
}