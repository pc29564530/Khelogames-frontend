import * as actionTypes from '../types/actionTypes';

const initialstate = {
    profile:[],
    authProfilePublicID: ""
}

const profileReducers = (state = initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }
        case actionTypes.SET_AUTH_PROFILE_PUBLIC_ID:
            return {
                ...state,
                authProfilePublicID: action.payload
            }
        default:
            return state
    }
}

export default profileReducers;