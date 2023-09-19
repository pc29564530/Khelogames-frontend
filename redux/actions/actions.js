import * as actionTypes from '../types/actionTypes';


export const sendOTP = (mobileNumber) => ({
    type: actionTypes.SEND_OTP,
    payload: mobileNumber
});

export const verifyOTP = (mobileNumber, otp) => ({
    type: actionTypes.VERIFY_OTP,
    payload: {mobileNumber, otp}
});

export const createUser = (mobileNumber) => ({
    type: actionTypes.CREATE_USER,
    payload: {mobileNumber}
});

export const setAuthStatus = (mobileNumber, isAuthenticated) => ({
    type: actionTypes.SET_AUTHENTICATED,
    payload: {mobileNumber, isAuthenticated}
});

export const setMobileNumber = (mobileNumber) => ({
    type: actionTypes.SET_MOBILE_NUMBER,
    payload: mobileNumber
});

export const setMobileNumberVerified = (isVerified) => ({
    type: actionTypes.SET_MOBILE_NUMBER_VERIFIED,
    payload: isVerified,
});