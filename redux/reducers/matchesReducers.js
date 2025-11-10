import * as actionTypes from '../types/actionTypes';

const initialState = {
    matches: [],
    match: null  // ✅ Changed from [] to null
}

const matchesReducers = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_MATCHES:
            console.log("GET_MATCHES:", action);
            return {
                ...state,
                matches: action.payload
            };

        case actionTypes.SET_MATCHES:
            return {
                ...state,
                matches: [...state.matches, action.payload],
            };

        case actionTypes.GET_MATCH:
            console.log("GET_MATCH:", action.payload);
            return {
                ...state,
                match: action.payload
            };

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

            // Helper function to update matches in arrays
            function updateStageArray(arr) {
                if (!Array.isArray(arr)) return arr;

                return arr.map(m => {
                    if (m?.id === matchId) {
                        console.log("✅ Found match in array - updating status");
                        return { ...m, status_code: statusCode };
                    }
                    return m;
                });
            }

            // Update matches array (tournament view)
            const updatedMatches = state.matches.map(stage => ({
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
            return {
                ...state,
                matches: updatedMatches,
            };
        }

        default:
            return state;
    }
}

export default matchesReducers;