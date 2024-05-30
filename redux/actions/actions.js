import AsyncStorage from "@react-native-async-storage/async-storage";
import * as actionTypes from '../types/actionTypes';
import { BASE_URL } from "../../constants/ApiConstants";

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

export const setAuthenticated = (isAuthenticated) => ({
    type: actionTypes.SET_AUTHENTICATED,
    payload: isAuthenticated
});

export const setMobileNumber = (mobileNumber) => ({
    type: actionTypes.SET_MOBILE_NUMBER,
    payload: mobileNumber
});

export const setMobileNumberVerified = (isVerified) => ({
    type: actionTypes.SET_MOBILE_NUMBER_VERIFIED,
    payload: isVerified,
});

export const setUser = (user) => ({
    type: actionTypes.SET_USER,
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
        type: actionTypes.SET_THREADS,
        payload: threads
    }
}

export const setLikes = (threadId, newLikesCount) => {
    return {
        type: actionTypes.SET_LIKES,
        payload: {threadId, newLikesCount}
    }
}

export const toggleLikes = (threadId, isLikes) => {
    return {
        type: actionTypes.TOGGLE_LIKES,
        payload: {threadId, isLikes}
    }
}

export const setComments = (comments) => {
    return {
        type: actionTypes.SET_COMMENTS,
        payload: comments
    }
}

export const addComments = (comments) => {
    return {
        type: actionTypes.ADD_COMMENTS,
        payload: comments
    }
}

export const setCommentText = (text) => {
    return {
        type: actionTypes.SET_COMMENT_TEXT,
        payload: text
    }
}

export const addThreads = (threads) => {
    return {
        type: actionTypes.ADD_THREADS,
        payload: threads
    }
}

export const userProfile = (user) => {
    return {
        type: actionTypes.USER_PROFILE,
        payload: user
    }
}

export const setFollowUser = (user) => {
    return {
        type: actionTypes.FOLLOW_USER,
        payload: user
    }
}

export const setUnFollowUser = (user) => {
    return {
        type: actionTypes.UNFOLLOW_USER,
        payload: user
    }
}

export const getFollowingUser = (users) => {
    return {
        type: actionTypes.GET_FOLLOWING_USER,
        payload: users
    }
}

export const getFollowerUser = (users) => {
    return {
        type: actionTypes.GET_FOLLOWER_USER,
        payload: users
    }
}

export const getJoinedCommunity = (joinedCommunity) => {
    return {
        type: actionTypes.GET_JOINED_COMMUNITY,
        payload: joinedCommunity,
    }
}

export const getAllCommunities = (community) => {
    return {
        type: actionTypes.GET_COMMUNITY,
        payload: community
    }
}

export const addCommunity = (community) => {
    return {
        type: actionTypes.ADD_COMMUNITY,
        payload: community
    }
}

export const addJoinedCommunity = (community) => {
    return {
        type: actionTypes.ADD_JOINED_COMMUNITY,
        payload: community
    }
}

export const setEditFullName = (full_name) => {
    return {
        type: actionTypes.SET_EDIT_FULL_NAME,
        payload: full_name
    }
}

export const setEditDescription = (description) => {
    return {
        type: actionTypes.SET_EDIT_DESCRIPTION,
        payload: description
    }
}

export const setProfileAvatar = (url) => {
    return {
        type: actionTypes.SET_PROFILE_AVATAR,
        payload: url
    }
}

export const getProfile = (profile) => {
    return {
        type: actionTypes.GET_PROFILE,
        payload: profile
    }
}

//matches score

export const getFootballMatchScore = (matchScore) => {
    return {
        type: actionTypes.GET_FOOTBALL_MATCHES,
        payload: matchScore
    }
}

export const getCricketMatchScore = (cricketMatchScore) => {
    return {
        type: actionTypes.GET_CRICKET_MATCHES,
        payload: cricketMatchScore
    }
}

export const getCricketPlayerScore = (cricketPlayerScore) => {
    return {
        type: actionTypes.GET_CRICKET_PLAYER_SCORE,
        payload: cricketPlayerScore
    }
}

export const getFootballPlayerScore = (playerScore) => {
    return {
        type: actionTypes.GET_FOOTBALLL_PLAYER_SCORE,
        payload: playerScore
    }
}

//standing

export const getCricketStanding = (standing) => {
    return {
        type: actionTypes.GET_CRICKET_STANDING,
        payload: score
    }
}

// export const getFootballStanding = (standing) => {
//     return {
//         type: actionTypes.GET_FOOTBALL_STANDING,
//         payload: score
//     }
// }

// export const addFootballMatchScore = (matchScore) => {
//     return {
//         type: actionTypes.ADD_FOOTBALL_MATCH,
//         payload: matchScore
//     }
// }

// export const addCricketMatchScore = (cricketMatchScore) => {
//     return {
//         type: actionTypes.ADD_CRICKET_MATCH,
//         payload: cricketMatchScore
//     }
// }

//Add stats function
//get stats function
//update stats function

//get tournament

export const getTournamentBySportAction = (tournaments) => {
    return {
        type: actionTypes.GET_TOURNAMENT_BY_SPORT,
        payload: tournaments
    }
};

export const getTournamentByIdAction = (tournament) => {
    return {
        type: actionTypes.GET_TOURNAMENT_BY_ID,
        payload: tournament
    }
} 

export const setSport = (sport) => {
    return {
        type: actionTypes.SET_SPORT,
        payload: sport
    }
}

export const setStandings = (standings) => {
    return {
        type: actionTypes.SET_STANDING,
        payload: standings
    }
}

export const setGroups = (groups) => {
    return {
        type: actionTypes.SET_GROUP,
        payload: groups
    }
}

export const addTeamToGroup = (teamId, groupId, tournamentId) => {
    return {
        type: actionTypes.ADD_TEAM_GROUP,
        payload: {teamId, groupId, tournamentId}
    }
}

export const addGroup = (groups) => {
    return {
        type: actionTypes.ADD_GROUP,
        payload: groups
    }
}

//add club 
export const createClub = (clubs) => {
    return {
        type: actionTypes.CREATE_CLUB,
        payload: clubs
    }
}

export const getClub = (clubs) => {
    return {
        type: actionTypes.GET_CLUB,
        payload: clubs
    }
}




