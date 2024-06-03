import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketPlayerScore: []
}

const cricketMatchPlayerScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_CRICKET_PLAYER_SCORE:
            return {
                ...state,
                cricketPlayerScore: action.payload
            }
        case actionTypes.ADD_CRICKET_MATCHES_PLAYER_SCORE:
            return {
                ...state,
                cricketPlayerScore: [...state.cricketPlayerScore, action.payload]
            }
        default:
            return state
    }
}

export default cricketMatchPlayerScoreReducers;
