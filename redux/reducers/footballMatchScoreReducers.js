import * as actionTypes from '../types/actionTypes';

const initialstate = {
    footballMatchScore: [],
    match: {}
}
const footballMatchScoreReducers = (state = initialstate, action) => {
    switch (action.type) {
        case actionTypes.SET_FOOTBALL_SCORE:
            if (!state.match || state.match.id !== action.payload.match_id) {
                return state
            }

            const isAway = state.match.away_team_id === action.payload.team_id
            const isHome = state.match.home_team_id === action.payload.team_id

            return {
                ...state,
                match: {
                    ...state.match,
                    homeScore: isHome ? { ...state.match.homeScore, ...action.payload } : state.match.homeScore,
                    awayScore: isAway ? { ...state.match.awayScore, ...action.payload } : state.match.awayScore,
                }
            }

        case actionTypes.ADD_FOOTBALL_SCORE:
            let addScore = state.footballMatchScore;
            if (addScore.id === action.payload.match_id) {
                const isAway = addScore.away_team_id === action.payload.team_id;

                updatedMatch = {
                    ...state.match,
                    homeScore: isAway ? addScore.homeScore : action.payload,
                    awayScore: isAway ? action.payload : addScore.awayScore,
                };
            }
            return {
                ...state,
                footballMatchScoreReducers: addScore,
                match: addScore
            }
        case actionTypes.GET_MATCH:
            return {
                ...state,
                match: action.payload
            }

        case actionTypes.SET_MATCH_STATUS: {
                    console.log("🔄 SET_MATCH_STATUS - Received payload:", action.payload);
                    
                    // ✅ FIX: Handle both payload formats
                    let matchId, statusCode;
                    
                    if (action.payload.match_id !== undefined) {
                        // Format 1: {match_id: 3, status_code: "in_progress"}
                        matchId = action.payload.match_id;
                        statusCode = action.payload.status_code;
                        console.log("📋 Format 1: match_id =", matchId, "status =", statusCode);
                    } else if (action.payload.id !== undefined) {
                        // Format 2: Full match object from WebSocket
                        matchId = action.payload.id;
                        statusCode = action.payload.status_code;
                        console.log("📋 Format 2 (WebSocket): id =", matchId, "status =", statusCode);
                    } else {
                        console.error("❌ Invalid payload - no match_id or id found:", action.payload);
                        return state;
                    }
        
                    console.log("🎯 Looking for match with ID:", matchId);
                    console.log("🎯 Current match ID:", state.match?.id);
        
                    let updateSingleMatch = state.match;
                    
                    if (state.match?.id === matchId) {
                        console.log("   Old status:", state.match.status_code);
                        console.log("   New status:", statusCode);
                        
                        updateSingleMatch = { 
                            ...state.match, 
                            status_code: statusCode 
                        };
                        
                        console.log("✅ Updated single match:", updateSingleMatch.status_code);
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
}


export default footballMatchScoreReducers;
