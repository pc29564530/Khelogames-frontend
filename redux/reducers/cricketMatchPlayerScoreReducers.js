import * as actionTypes from '../types/actionTypes';

const initialstate = {
    battingScore: {innings: {}},
    bowlingScore: {innings: {}},
    wicketFallen: [],
    currentBatsman: [],
    currentBowler: [],
    isCurrentBowler: null,
}

const cricketMatchPlayerScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_BATSMAN:
            return {
                ...state,
                currentBatsman: action.payload || []
            }
        
        case actionTypes.SET_CURRENT_BOWLER:
            return {
                ...state,
                currentBowler: action.payload || []
            }
        
        case actionTypes.INITIALIZE_NEW_INNING: {
            const newInningNumber = action.payload.inning_number;
            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings:{
                        ...(state.battingScore?.innings || {}),
                        [newInningNumber]:[]
                    }
                },
                bowlingScore: {
                    ...state.bowlingScore,
                    innings:{
                        ...(state.bowlingScore?.innings || {}),
                        [newInningNumber]:[]
                    }
                }
            }
        }
        
        case actionTypes.UPDATE_BATSMAN_SCORE: {
            const inningKeyBatsman = String(action.payload.inning_number);
            const currentBattingInning = state?.battingScore?.innings || {};
            const batsmanInning = currentBattingInning[inningKeyBatsman] || [];

            // Create updated inning array
            const updatedBatsmanInning = batsmanInning.map(batter => {
                if (batter.batsman_id === action.payload.batsman_id) {
                    return {
                        ...batter,
                        ...action.payload
                    };
                }
                return batter;
            });

            const updatedCurrentBatsman = state.currentBatsman.map(batsman => {
                const batsmanId = batsman.batsman_id;
                const payloadBatsmanId = action.payload.batsman_id;
                if (batsmanId === payloadBatsmanId) {
                    const updated = { ...batsman, ...action.payload };
                    return updated;
                }
                return batsman;
            });

            return {
                ...state,
                currentBatsman: updatedCurrentBatsman,
                battingScore: {
                    ...state.battingScore,
                    innings: {
                        ...currentBattingInning,
                        [inningKeyBatsman]: updatedBatsmanInning
                    }
                }
            }
        }
        
        case actionTypes.UPDATE_BOWLER_SCORE: {
            const inningKeyBowler = String(action.payload.inning_number);
            const currentBowlerInnings = state?.bowlingScore?.innings || {};
            const bowlerInning = currentBowlerInnings[inningKeyBowler] || [];

            const updateBowlerInning = bowlerInning.map(bowler => {
                const bowlerId = bowler.player?.id || bowler.bowler_id || bowler.id;
                const payloadId = action.payload.bowler_id || action.payload.player?.id || action.payload.id;
                
                if(bowlerId === payloadId) {
                    return {
                       ...bowler,
                       ...action.payload
                    }
                }
                return bowler;
            });
            const updatedCurrentBowler = state.currentBowler.map(bowler => {
                const bowlerId = bowler.bowler_id;
                const payloadBowlerId = action.payload.bowler_id;
                if (bowlerId === payloadBowlerId) {
                    const updated = { ...bowler, ...action.payload };
                    return updated;
                }
                return bowler;
            });

            return {
                ...state,
                currentBowler: updatedCurrentBowler,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: {
                        ...currentBowlerInnings,
                        [inningKeyBowler]: updateBowlerInning
                    }
                }
            };
        }
        
        case actionTypes.ADD_BATSMAN: {
            const inningKey = String(action.payload.inning_number);
            const currentBatsmanInnings = state?.battingScore?.innings || {};
            const inningBatsmen = currentBatsmanInnings[inningKey] || [];

            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings: {
                        ...currentBatsmanInnings,
                        [inningKey]: [...inningBatsmen, action.payload]
                    }
                }
            };
        }
        
        case actionTypes.ADD_BOWLER: {
            const addBowlerInningKey = String(action.payload.inning_number);
            const addBowlerInnings = state?.bowlingScore?.innings || {};
            const inningBowlers = addBowlerInnings[addBowlerInningKey] || [];

            return {
                ...state,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: {
                        ...addBowlerInnings,
                        [addBowlerInningKey]: [...inningBowlers, action.payload]
                    }
                }
            };
        }
        
        case actionTypes.GET_CRICKET_PLAYER_SCORE:
            return {
                ...state,
                cricketPlayerScore: action.payload
            }
        
        case actionTypes.ADD_CRICKET_MATCHES_PLAYER_SCORE:
            return {
                ...state,
                cricketPlayerScore: [...(state.cricketPlayerScore || []), action.payload]
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
        
        case actionTypes.ADD_CRICKET_WICKET_FALLEN:
            return {
                ...state,
                wicketFallen: [...state.wicketFallen, action.payload]
            }
        
        default:
            return state;
    }
}

// SIMPLE SELECTORS - Use the direct arrays from state
export const selectCurrentBatsmen = (state, inningNumber) => {
    
    const reducerState = state.cricketPlayerScore;
    
    if (!reducerState) {
        console.log("⚠️ cricketPlayerScore reducer not found!");
        console.log("Available reducers:", Object.keys(state));
        return [];
    }
    
    // Use the direct currentBatsman array
    const currentBatsmen = reducerState.currentBatsman || [];
    
    return currentBatsmen;
};

export const selectCurrentBowler = (state, inningNumber) => {
    
    const reducerState = state.cricketPlayerScore;
    
    if (!reducerState) {
        console.log("⚠️ cricketPlayerScore reducer not found!");
        console.log("Available reducers:", Object.keys(state));
        return [];
    }
    
    // Use the direct currentBowler array
    const currentBowlers = reducerState.currentBowler || [];
    
    return currentBowlers;
};

export default cricketMatchPlayerScoreReducers;