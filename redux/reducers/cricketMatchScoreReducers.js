import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketMatchScore: [],
    cricketInningScore: [],
    batTeam: null,
    match:null
};

const cricketMatchScoreReducers = (state = initialstate, action) => {
    switch (action.type) {
        case actionTypes.SET_BAT_TEAM:
            return {
                ...state,
                batTeam: action.payload
            }
        case actionTypes.GET_CRICKET_MATCHES:
            return {
                ...state,
                cricketMatchScore: action.payload
            };

        case actionTypes.ADD_CRICKET_SCORE:
            return {
                ...state,
                cricketMatchScore: [...state.cricketMatchScore, action.payload]
            };

        case actionTypes.GET_CRICKET_INNING_SCORE:
            return {
                ...state,
                cricketInningScore: action.payload
            };
        case actionTypes.GET_MATCH:
            return {
                ...state,
                match: action.payload || null,
            };
        case actionTypes.UPDATE_INNING_SCORE:
            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: action.payload.team_id === state.match.homeTeam.id ? state.match.homeScore.map((inning) => {
                        if (!inning) return inning;
                        return inning.inning_number===action.payload.inning_number ?
                                {...inning, ...action.payload}
                                : inning
                    })
                    : state.match.homeScore,
                    awayScore: action.payload.team_id === state.match.awayTeam.id ? state.match.awayScore.map((inning) => {
                        if (!inning) return inning;                      
                        return inning.inning_number===action.payload.inning_number ?
                                {...inning, ...action.payload}
                                : inning
                    })
                    : state.match.awayScore,
                }
            };
        case actionTypes.SET_END_INNING:
            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: action.payload.team_id === state.match.homeTeam.id ? action.payload : state.match.homeScore,
                    awayScore: action.payload.team_id === state.match.awayTeam.id ? action.payload : state.match.awayScore
                }

            }
        default:
            return state;
    }
};

export default cricketMatchScoreReducers;