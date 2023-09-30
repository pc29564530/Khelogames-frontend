import * as actionTypes from '../types/actionTypes';

const initialState = {
    mobileNumber: '',
    otp: ''
};

const signUpReducers = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.SEND_OTP:
            return {
                ...state,
                mobileNumber: action.payload
            };
        case actionTypes.VERIFY_OTP:
            return {
                ...state,
                mobileNumber: state.payload,
                otp: action.payload
            }
        default:
            return state;
    }
}

export default signUpReducers;