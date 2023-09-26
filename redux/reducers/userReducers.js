import * as actionTypes from '../types/actionTypes';

const initialState = {
    user: [],
    following: []
}

const userReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_PROFILE:
            return {
                ...state,
                user: action.payload
            }
        case actionTypes.GET_FOLLOW_USER:
            return {
                ...state,
                following: action.payload
            }
        case actionTypes.FOLLOW_USER:
            return {
                ...state,
                following: [...state.following, action.payload] 
            }
        case actionTypes.UNFOLLOW_USER:
            console.log(user)
            return {
                ...state,
                following: state.following.filter((user) => user !== action.payload),
            }
        default: 
            return state
    }
}

export default userReducers;