import * as actionTypes from '../types/actionTypes';

const initalState = {
    mobileNumber: '',
    isAuthenticated: false,
    isMobileNumberVerified: false,
};

const authReducers = (state=initalState, action) => {
    switch (action.type) {
        case actionTypes.SET_MOBILE_NUMBER:
            return {
                ...state,
                mobileNumber: action.payload,
            }
        case actionTypes.SET_AUTHENTICATED:
            return {
                ...state,
                isAuthenticated: action.payload,
            }
        case actionTypes.SET_MOBILE_NUMBER_VERIFIED:
            return {
                ...state,
                isMobileNumberVerified: action.payload
            }
        default:
            return state;
    }
}

export default authReducers;