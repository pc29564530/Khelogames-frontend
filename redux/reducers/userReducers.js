import * as actionTypes from '../types/actionTypes';

const initialState = {
    user: null,
    following: [],
    follower: [],
    isFollowing: false,
}

const userReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                ...state,
                user: action.payload
            }
        case actionTypes.FOLLOW_USER:
            return {
                ...state,
                following: [...(state.following || []), action.payload]
            }
        case actionTypes.GET_FOLLOWER_USER:
            return {
                ...state,
                follower: action.payload || []
            }
        case actionTypes.GET_FOLLOWING_USER:
            return {
                ...state,
                following: action.payload || []
            }
        case actionTypes.UNFOLLOW_USER:
            if(!state.following) {
                return state;
            }
            const updatedFollowing = state?.following?.filter((user) => user.public_id !== action.payload)
            return {
                ...state,
                following: updatedFollowing,
            }
        
        case actionTypes.IS_FOLLOWING:
            return {
                ...state,
                isFollowing: action.payload
            }
        default: 
            return state
    }
}

export default userReducers;