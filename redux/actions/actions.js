import AsyncStorage from "@react-native-async-storage/async-storage";
import * as actionTypes from '../types/actionTypes';

export const sendOTP = (mobileNumber) => ({
    type: 'SEND_OTP',
    payload: mobileNumber
});

export const verifyOTP = (mobileNumber, otp) => ({
    type: 'VERIFY_OTP',
    payload: {mobileNumber, otp}
});

export const createUser = (mobileNumber) => ({
    type: 'CREATE_USER',
    payload: {mobileNumber}
});

export const setAuthenticated = (isAuthenticated) => ({
    type: 'SET_AUTHENTICATED',
    payload: isAuthenticated
});

// export const setMobileNumber = (mobileNumber) => ({
//     type: 'SET_MOBILE_NUMBER',
//     payload: mobileNumber
// });

export const setMobileNumberVerified = (isVerified) => ({
    type: 'SET_MOBILE_NUMBER_VERIFIED',
    payload: isVerified,
});

export const setUser = (user) => ({
    type: 'SET_USER',
    payload: user
})

export const logout = () => {
    return {
        type: actionTypes.LOGOUT
    }  
}

export const checkExpireTime = () => {
    return async (dispatch) => {
      try {
        const currentTime = new Date().getTime();
        const refreshTokenExpireTime = await AsyncStorage.getItem('RefreshTokenExpiresAt');
  
        if (refreshTokenExpireTime && currentTime.toString() > refreshTokenExpireTime) {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Error in checkExpireTime:', error);
      }
    };
};

export const setThreads = (threads) => {
    return { 
        type: 'SET_THREADS',
        payload: threads
    }
}

export const setLikes = (threadId, newLikesCount) => {
    return {
        type: 'SET_LIKES',
        payload: {threadId, newLikesCount}
    }
}

export const toggleLikes = (threadId, isLikes) => {
    return {
        type: 'TOGGLE_LIKES',
        payload: {threadId, isLikes}
    }
}

export const setComments = (comments) => {
    return {
        type: 'SET_COMMENTS',
        payload: comments
    }
}

export const addComments = (comments) => {
    return {
        type: 'ADD_COMMENTS',
        payload: comments
    }
}

export const setCommentText = (text) => {
    return {
        type: 'SET_COMMENT_TEXT',
        payload: text
    }
}