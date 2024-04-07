import * as actionTypes from '../types/actionTypes';

const initialstate = {
    profile:[]
}

const profileReducers = (state = initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_PROFILE:
            return {
                ...state,
                profile: action.payload
            }
        default:
            return state
    }
}

export default profileReducers;