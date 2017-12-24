/**
 * Created by tezhdmi on 06/12/17.
 */
import * as actions from '../actions/authActions';

const initialState = {
    requesting: false,
    initialized: false,
    error: null,
    token: null,
    profile: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case actions.LOGON_REQUEST:
            return {
                ...state,
                requesting: true
            };

        case actions.LOGON_SUCCESS:
            return {
                ...initialState,
                ...action.profile,
                requesting: false,
                initialized: true
            };
            
        case actions.LOGON_ERROR:
            return {
                ...initialState,
                requesting: false,
                error: action.error,
                initialized: true
            };
            
        case actions.LOGON_CLEAR:
            return {
                ...initialState,
                initialized: true
            };
            
        default:
            return state;
    }
}