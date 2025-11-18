import * as actionTypes from '../types/actionTypes';

const initalState = {
    isAuthenticated: false,
    isMobileNumberVerified: false,
    expireTime:'',
    loading: true,
};

const authReducers = (state=initalState, action) => {
    switch (action.type) {
        case actionTypes.SET_AUTHENTICATED:
            return {
                ...state,
                isAuthenticated: action.payload,
                loading: false
            }
        case actionTypes.SET_MOBILE_NUMBER_VERIFIED:
            return {
                ...state,
                isMobileNumberVerified: action.payload
            }
        case actionTypes.CHECK_EXPIRE_TIME:
            return {
                ...state,
                expiretime: action.payload
            }
        case actionTypes.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                user: null
            }
        default:
            return state;
    }
}

export default authReducers;