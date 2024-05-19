import * as actionTypes from '../types/actionTypes';

const initialstate = {
    playerScore: []
}

export const footballMatchPlayerScore = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.GET_FOOTBALLL_PLAYER_SCORE:
            return {
                ...state,
                playerScore: action.payload
            }
        case actionTypes.ADD_FOOTBALL_MATCHES_PLAYER_SCORE:
            return {
                ...state,
                playerScore: [...state.playerScore, action.payload]
            }
        default:
            return state
    }
}