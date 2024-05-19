import * as actionTypes from '../types/actionTypes';

const initialstate = {
    matchScore: []
}

export const footballMatchScore = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_FOOTBALL_MATCHES:
            return {
                ...state,
                matchScore: action.payload
            }
        case actionTypes.ADD_FOOTBALL_MATCHES:
            return {
                ...state,
                footballScore: [...state.footballScore, action.payload]
            }
        default:
            return state
    }
}