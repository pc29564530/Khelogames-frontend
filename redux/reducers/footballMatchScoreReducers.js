import * as actionTypes from '../types/actionTypes';

const initialstate = {
    footballMatchScore: []
}
const footballMatchScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.SET_FOOTBALL_SCORE:
            if(state.match_id === action.payload.match_id) {
                if(state.away_team_id === action.payload.team_id) {
                    return {
                        ...match,
                        awayScore: {
                            ...match.awayScore,
                            ...action.payload
                        }
                    }
                } else {
                    return {
                        ...match,
                        homeScore: {
                            ...match.homeScore,
                            ...action.payload
                        }
                    }
                }
            }

        case actionTypes.ADD_FOOTBALL_SCORE:
            if(state.match_id === action.payload.match_id) {
                if(state.away_team_id === action.payload.team_id) {
                    return {
                        awayScore: action.payload
                    }
                } else {
                    return {
                        homeScore: action.payload
                    }
                }
            }
        default:
            return state
    }
}

export default footballMatchScoreReducers;
