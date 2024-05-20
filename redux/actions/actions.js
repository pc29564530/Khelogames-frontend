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

export const setMobileNumber = (mobileNumber) => ({
    type: 'SET_MOBILE_NUMBER',
    payload: mobileNumber
});

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

        const currentTime = new Date();
        const refreshTokenExpireTime = await AsyncStorage.getItem('RefreshTokenExpiresAt');
        const expiresAt = new Date(refreshTokenExpireTime)
  
        if (expiresAt > currentTime) {
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

export const addThreads = (threads) => {
    return {
        type: 'ADD_THREADS',
        payload: threads
    }
}

export const userProfile = (user) => {
    return {
        type: 'USER_PROFILE',
        payload: user
    }
}

export const setFollowUser = (user) => {
    return {
        type: 'FOLLOW_USER',
        payload: user
    }
}

export const setUnFollowUser = (user) => {
    console.log(user)
    return {
        type: 'UNFOLLOW_USER',
        payload: user
    }
}

export const getFollowingUser = (users) => {
    return {
        type: 'GET_FOLLOWING_USER',
        payload: users
    }
}

export const getFollowerUser = (users) => {
    return {
        type: 'GET_FOLLOWER_USER',
        payload: users
    }
}

export const getJoinedCommunity = (community) => {
    return {
        type: 'JOINED_COMMUNITY',
        payload: community
    }
}

export const getAllCommunities = (community) => {
    return {
        type: 'COMMUNITY',
        payload: community
    }
}

export const addCommunity = (community) => {
    return {
        type: 'ADD_COMMUNITY',
        payload: community
    }
}

export const addJoinedCommunity = (community) => {
    return {
        type: 'ADD_JOINED_COMMUNITY',
        payload: community
    }
}

export const setEditFullName = (full_name) => {
    console.log("Action: ",full_name)
    return {
        type: 'SET_EDIT_FULL_NAME',
        payload: full_name
    }
}

export const setEditDescription = (description) => {
    return {
        type: 'SET_EDIT_DESCRIPTION',
        payload: description
    }
}

export const setProfileAvatar = (url) => {
    return {
        type: 'SET_PROFILE_AVATAR',
        payload: url
    }
}

export const getProfile = (profile) => {
    return {
        type: 'GET_PROFILE',
        payload: profile
    }
}

//matches score

export const getFootballMatchScore = (matchScore) => {
    console.log("Line no 207: ", matchScore )
    return {
        type: 'GET_FOOTBALL_MATCHES',
        payload: matchScore
    }
}

export const getCricketMatchScore = (cricketMatchScore) => {
    return {
        type: 'GET_CRICKET_MATCHES',
        payload: cricketMatchScore
    }
}

export const getCricketPlayerScore = (cricketPlayerScore) => {
    return {
        type: 'GET_CRICKET_PLAYER_SCORE',
        payload: cricketPlayerScore
    }
}

export const getFootballPlayerScore = (playerScore) => {
    return {
        type: 'GET_FOOTBALLL_PLAYER_SCORE',
        payload: playerScore
    }
}

//standing

export const getCricketStanding = (standing) => {
    return {
        type: 'GET_CRICKET_STANDING',
        payload: score
    }
}

export const getFootballStanding = (standing) => {
    return {
        type: 'GET_FOOTBALL_STANDING',
        payload: score
    }
}

//Add stats function
//get stats function
//update stats function


