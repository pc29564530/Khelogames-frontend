import * as actionTypes from '../types/actionTypes';

const initialstate = {
    battingScore: {innings: {}},
    bowlingScore: {innings: {}},
    wicketFallen: [],
    currentBatsman: [],
    currentBowler: [],
    isCurrentBowler: null,
    actionRequired: null,
}

const cricketMatchPlayerScoreReducers = (state=initialstate, action) => {

    switch (action.type) {
        case actionTypes.SET_ACTION_REQUIRED:
            return {
                ...state,
                actionRequired: action.payload
            }
    
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
            // console.log("Inning Number: ", inningKeyBatsman)
            // console.log("Batsman Inning: ", currentBattingInning)
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
            // payloadOut when the batsman is not longer batting he is out
            const payloadOut =
                action.payload.is_currently_batting === false ||
                action.payload.batting_status === false;

            const updatedCurrentBatsman = state.currentBatsman
                .map(batsman => {
                    if (batsman.batsman_id === action.payload.batsman_id) {
                        return { ...batsman, ...action.payload };
                    }
                    return batsman;
                })
                .filter(batsman => {
                    if (batsman.batsman_id !== action.payload.batsman_id) return true;
                    return !payloadOut;
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

            const existingCurrent = state.currentBatsman || [];
            const withoutDup = existingCurrent.filter(
                b => b.batsman_id != action.payload.batsman_id
            );

            const updatedCurrentBatsman = [...withoutDup, action.payload];

            return {
                ...state,
                currentBatsman: updatedCurrentBatsman,
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

            const updatedCurrentBowler = [action.payload];

            return {
                ...state,
                currentBowler: updatedCurrentBowler,
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