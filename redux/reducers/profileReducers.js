import * as actionTypes from '../types/actionTypes';

const initialstate = {
    profile:[],
    authProfilePublicID: "",
    authUser: [],
    currentProfile: [],
    authProfile: [],
    authUserPublicID: "",
}

const profileReducers = (state = initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }
        case actionTypes.SET_AUTH_USER_PUBLIC_ID:
            return {
                ...state,
                authUserPublicID: action.payload
            }
        case actionTypes.SET_AUTH_PROFILE_PUBLIC_ID:
            return {
                ...state,
                authProfilePublicID: action.payload
            }
        case actionTypes.SET_AUTH_USER:
            return {
                ...state,
                authUser: action.payload
            }
        case actionTypes.SET_CURRENT_PROFILE:
            return {
                ...state,
                currentProfile: action.payload
            }
        case actionTypes.SET_AUTH_PROFILE:
            return {
                ...state,
                authProfile: action.payload
            }
        default:
            return state
    }
}

export default profileReducers;