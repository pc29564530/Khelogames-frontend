import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketMatchScore: [],
    cricketInningScore: [],
    batTeam: null,
    match:{}
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
                match: action.payload || {},
            };
        case actionTypes.UPDATE_INNING_SCORE:
            let newHomeScore = state.match.homeScore;
            let newAwayScore = state.match.awayScore;

            if (action.payload.team_id === state.match.homeTeam.id) {
                const existingIndex = state.match.homeScore.findIndex(inning => inning && inning.inning_number === action.payload.inning_number);
                if (existingIndex !== -1) {
                    newHomeScore = state.match.homeScore.map((inning, index) =>
                        index === existingIndex ? {...inning, ...action.payload} : inning
                    );
                } else {
                    newHomeScore = [...state.match.homeScore, action.payload];
                }
            } else if (action.payload.team_id === state.match.awayTeam.id) {
                const existingIndex = state.match.awayScore.findIndex(inning => inning && inning.inning_number === action.payload.inning_number);
                if (existingIndex !== -1) {
                    newAwayScore = state.match.awayScore.map((inning, index) =>
                        index === existingIndex ? {...inning, ...action.payload} : inning
                    );
                } else {
                    newAwayScore = [...state.match.awayScore, action.payload];
                }
            }

            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: newHomeScore,
                    awayScore: newAwayScore,
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
        case actionTypes.SET_MATCH_STATUS: {
            console.log("🔄 SET_MATCH_STATUS - Received payload:", action.payload);
            
            // FIX: Handle both payload formats
            let matchId, statusCode;
            
            if (action.payload.match_id !== undefined) {
                // Format 1: {match_id: 3, status_code: "in_progress"}
                matchId = action.payload.match_id;
                statusCode = action.payload.status_code;
                console.log("Format 1: match_id =", matchId, "status =", statusCode);
            } else if (action.payload.id !== undefined) {
                // Format 2: Full match object from WebSocket
                matchId = action.payload.id;
                statusCode = action.payload.status_code;
                console.log("Format 2 (WebSocket): id =", matchId, "status =", statusCode);
            } else {
                console.error("Invalid payload - no match_id or id found:", action.payload);
                return state;
            }

            console.log("Looking for match with ID:", matchId);
            console.log("Current match ID:", state.match?.id);

            // CRITICAL: Update single match (match detail view)
            let updateSingleMatch = state.match;
            
            if (state.match?.id === matchId) {
                console.log("Match ID matches - updating single match");
                console.log("   Old status:", state.match.status_code);
                console.log("   New status:", statusCode);
                
                updateSingleMatch = { 
                    ...state.match, 
                    status_code: statusCode 
                };
                
                console.log("Updated single match:", updateSingleMatch.status_code);
            } else {
                console.log("ℹ️ Match ID doesn't match current match - no update");
                console.log("   Current:", state.match?.id, "Expected:", matchId);
            }

            console.log("📤 Returning new state with status:", updateSingleMatch?.status_code);

            return {
                ...state,
                match: updateSingleMatch,
            };
        }
        default:
            return state;
    }
};

export default cricketMatchScoreReducers;