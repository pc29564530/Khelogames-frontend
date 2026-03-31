import * as actionTypes from '../types/actionTypes';

const initialState = {
    matches: [],
    match: null,
}

const matchesReducers = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_MATCHES:
            if (action.payload===undefined || action.payload === null) {
                return state;
            }
            return {
                ...state,
                matches: action.payload || []
            };

        case actionTypes.SET_MATCHES:
            return {
                ...state,
                matches: [...state.matches, action.payload],
            };

        case actionTypes.GET_MATCH:
            console.log("Match: ", state.match)
            return {
                ...state,
                match: action.payload,
            };

        case actionTypes.SET_MATCH_STATUS: {
            const matchPublicID = action.payload.public_id ?? action.payload.public_id;
            const statusCode = action.payload.status_code;
            const result = action.payload.result;

            const isStaged = state.matches?.[0]?.league_stage || state.matches?.[0]?.knockout_stage || state.matches?.[0]?.group_stage;

            if (!matchPublicID) {
                return state;
            }

            // update status_code AND result in stage arrays
            function updateStageArray(arr) {
                if (!Array.isArray(arr)) return arr;

                return arr.map(m => {
                    if (m?.public_id === matchPublicID) {
                        return {
                            ...m,
                            status_code: statusCode ?? m.status_code,
                            // result ?? m.result,
                        };
                    }
                    return m;
                });
            }

            let updatedMatches;

            if(isStaged) {
                // Update matches array (tournament view)
                updatedMatches = state.matches.map(stage => ({
                    ...stage,
                    league_stage: updateStageArray(stage.league_stage),
                    group_stage: updateStageArray(stage.group_stage),
                    knockout_stage: {
                        ...stage.knockout_stage,
                        final: updateStageArray(stage.knockout_stage?.final),
                        semifinal: updateStageArray(stage.knockout_stage?.semifinal),
                        quaterfinal: updateStageArray(stage.knockout_stage?.quaterfinal),
                        round_16: updateStageArray(stage.knockout_stage?.round_16),
                        round_32: updateStageArray(stage.knockout_stage?.round_32),
                        round_64: updateStageArray(stage.knockout_stage?.round_64),
                        round_128: updateStageArray(stage.knockout_stage?.round_128),
                    },
                }));
            } else {
                updatedMatches = (state.matches || []).map(m => {
                    if (m?.public_id === matchPublicID) {
                        return {
                            ...m,
                            status_code: statusCode ?? m.status_code,
                            result: result ?? m.result,
                        };
                    }
                    return m;
                });
            }

            // Update single match (match detail view)
            const updatedMatch = (state.match?.public_id === matchPublicID)
                ? { ...state.match, status_code: statusCode ?? state.match.status_code, result: result ?? state.match.result }
                : state.match;

            return {
                ...state,
                matches: updatedMatches,
                match: updatedMatch,
            };
        }

        case actionTypes.SET_MATCH_RESULT: {
            const matchId = action.payload.match_id ?? action.payload.id;
            const result = action.payload.result;
            const isStaged = state.matches?.[0]?.league_stage || state.matches?.[0]?.knockout_stage || state.matches?.[0]?.group_stage;
            if (!matchId) {
                return state;
            }

            function updateResultInArray(arr) {
                if (!Array.isArray(arr)) return arr;
                return arr.map(m => {
                    if (m?.id === matchId) {
                        return { ...m, result: result ?? m.result };
                    }
                    return m;
                });
            }

            if(isStaged) {
                // Update matches array (tournament view)
                updatedMatches = state.matches.map(stage => ({
                    ...stage,
                    league_stage: updateResultInArray(stage.league_stage),
                    group_stage: updateResultInArray(stage.group_stage),
                    knockout_stage: {
                        ...stage.knockout_stage,
                        final: updateResultInArray(stage.knockout_stage?.final),
                        semifinal: updateResultInArray(stage.knockout_stage?.semifinal),
                        quaterfinal: updateResultInArray(stage.knockout_stage?.quaterfinal),
                        round_16: updateResultInArray(stage.knockout_stage?.round_16),
                        round_32: updateResultInArray(stage.knockout_stage?.round_32),
                        round_64: updateResultInArray(stage.knockout_stage?.round_64),
                        round_128: updateResultInArray(stage.knockout_stage?.round_128),
                    },
                }));
            } else {
                updatedMatches = (state.matches || []).map(m => {
                    if (m?.public_id === matchPublicID) {
                        return {
                            ...m,
                            status_code: statusCode ?? m.status_code,
                            result: result ?? m.result,
                        };
                    }
                    return m;
                });
            }

            // Update single match (match detail view)
            const updatedResultMatch = (state.match?.id === matchId)
                ? { ...state.match, result: result ?? state.match.result }
                : state.match;

            return {
                ...state,
                matches: updatedMatches,
                match: updatedResultMatch,
            };
        }

        // Football: update score on match
        case actionTypes.SET_FOOTBALL_SCORE: {
            if (!state.match || state.match.id !== action.payload.match_id) {
                return state;
            }
            const isAway = state.match.away_team_id === action.payload.team_id;
            const isHome = state.match.home_team_id === action.payload.team_id;

            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: isHome ? { ...state.match.homeScore, ...action.payload } : state.match.homeScore,
                    awayScore: isAway ? { ...state.match.awayScore, ...action.payload } : state.match.awayScore,
                }
            };
        }

        // Badminton: update score on match
        case actionTypes.SET_BADMINTON_SCORE: {
            console.log("Action Trigger; ", action.payload)
            if (!state.match || state.match.public_id !== action.payload.match_public_id) {
                return state;
            }
            console.log("State: ", state.match);
            console.log("Action: ", action.payload)
            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: action.payload.homeScore ?? state.match.homeScore,
                    awayScore: action.payload.awayScore ?? state.match.awayScore,
                },
            };
        }

        default:
            return state;
    }
}

export default matchesReducers;