import * as actionTypes from '../types/actionTypes';

const initialState = {
    matches: [],
    match: null
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
            // Backend returns: { id, public_id, status_code, result, ... }
            const matchPublicID = action.payload.public_id ?? action.payload.public_id;
            const statusCode = action.payload.status_code;
            const result = action.payload.result;

            if (!matchPublicID) {
                return state;
            }

            // Helper: update status_code AND result in stage arrays
            function updateStageArray(arr) {
                if (!Array.isArray(arr)) return arr;

                return arr.map(m => {
                    if (m?.public_id === matchPublicID) {
                        return {
                            ...m,
                            status_code: statusCode ?? m.status_code,
                            // result: result ?? m.result,
                        };
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

        case actionTypes.SET_MATCH_RESULT: {
            const matchId = action.payload.match_id ?? action.payload.id;
            const result = action.payload.result;

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

            const updatedMatches = state.matches.map(stage => ({
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