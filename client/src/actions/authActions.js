/**
 * Created by tezhdmi on 06/12/17.
 */

export const LOGON = 'LOGON';
export const LOGOUT = 'LOGOUT';

export const LOGON_REQUEST = 'LOGON_REQUEST';
export const LOGON_SUCCESS = 'LOGON_SUCCESS';
export const LOGON_ERROR = 'LOGON_ERROR';
export const LOGON_CLEAR = 'LOGON_CLEAR';

export const userLogon = (login, password) => ({type: LOGON, credentials: {login, password}});
export const userLogout = () => ({type: LOGOUT});
export const logonClear = () => ({type: LOGON_CLEAR});