import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketMatchScore: []
}

const cricketMatchScoreReducers = (state=initialstate, action) => {
    console.log("Linen no 8 Cricket: ", state.cricketMatchScore)
    switch (action.type) {
        case actionTypes.GET_CRICKET_MATCHES:
            return {
                ...state,
                cricketMatchScore: action.payload
            }
        case actionTypes.ADD_CRICKET_MATCHES:
            return {
                ...state,
                cricketMatchScore: [...state.cricketMatchScore, action.payload]
            }
        default:
            return state
    }
}

export default cricketMatchScoreReducers;