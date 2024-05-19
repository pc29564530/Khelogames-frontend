import * as actionTypes from '../types/actionTypes';

const initialstate = {
    matchScore: []
}

export const cricketMatchScore = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_CRICKET_MATCHES:
            return {
                ...state,
                matchScore: action.payload
            }
        case actionTypes.ADD_CRICKET_MATCHES:
            return {
                ...state,
                matchScore: [...state.matchScore, action.payload]
            }
        default:
            return state
    }
}