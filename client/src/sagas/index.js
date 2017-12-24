/**
 * Created by tezhdmi on 06/12/17.
 */
import {all} from 'redux-saga/effects';
import authSaga from './authSaga';
import chatSaga from './chatSaga';

export default function* rootSaga() {
    yield all([
        authSaga(),
        chatSaga()
    ]);
}