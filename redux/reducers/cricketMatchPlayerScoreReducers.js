import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketPlayerScore: [],
    battingScore: [],
    bowlingScore: [],
    wicketFallen: [],
}

const cricketMatchPlayerScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.ADD_BATSMAN:
            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings: [...state.battingScore.innings, action.payload],
                }
            }
        case actionTypes.ADD_BOWLER:
            return {
                ...state,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: [...state.bowlingScore.innings, action.payload],
                }
            }
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
        case actionTypes.GET_CRICKET_BATTING_SCORE:
            return {
                ...state,
                battingScore: action.payload
            }
        case actionTypes.GET_CRICKET_BOWLING_SCORE:
            return {
                ...state,
                bowlingScore: action.payload
            }
        case actionTypes.GET_CRICKET_WICKET_FALLEN:
            return {
                ...state,
                wicketFallen: action.payload
            }
        default:
            return state
    }
}

export default cricketMatchPlayerScoreReducers;
