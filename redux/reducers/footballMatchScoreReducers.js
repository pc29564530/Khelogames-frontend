import * as actionTypes from '../types/actionTypes';

const initialstate = {
    matchScore: []
}
const footballMatchScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_FOOTBALL_MATCHES:
            return {
                ...state,
                matchScore: action.payload
            }
        case actionTypes.ADD_FOOTBALL_MATCHES:
            return {
                ...state,
                matchScore: [...state.matchScore, action.payload]
            }
        default:
            return state
    }
}

export default footballMatchScoreReducers;
