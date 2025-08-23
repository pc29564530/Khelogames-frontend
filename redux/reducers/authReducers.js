import * as actionTypes from '../types/actionTypes';

const initalState = {
    // mobileNumber: '',
    isAuthenticated: null,
    isMobileNumberVerified: false,
    expireTime:'',
    user: null,
    loading: true,
};

const authReducers = (state=initalState, action) => {
    switch (action.type) {
        // case actionTypes.SET_MOBILE_NUMBER:
        //     return {
        //         ...state,
        //         mobileNumber: action.payload.mobileNumber
        //     }
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
        case actionTypes.SET_USER:
            return {
                ...state,
                user: action.payload
            }
        case actionTypes.CHECK_EXPIRE_TIME:
            return {
                ...state,
                expiretime: action.payload
            }
        case actionTypes.LOGOUT:
            return {
                ...state,
                isAuthenticated: action.payload,
                user: action.payload
            }
        default:
            return state;
    }
}

export default authReducers;