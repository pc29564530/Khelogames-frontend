import { current } from '@reduxjs/toolkit';
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
                currentBatsman: action.payload
            }
        case actionTypes.SET_CURRENT_BOWLER:
            return {
                ...state,
                currentBowler: action.payload
            }
        case actionTypes.INITIALIZE_NEW_INNING:
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
        case actionTypes.UPDATE_BATSMAN_SCORE:
            let inningKeyBatsman = String(action.payload.inning_number);
            let currentBattingInning = state?.battingScore?.innings;
            let batsmanInning = currentBattingInning[inningKeyBatsman] || [];
            // Create updated inning array
            const updatedBatsmanInning = batsmanInning.map(batter => {
                if (batter.player.id === action.payload.player.id) {
                    return {
                        ...batter,
                        ...action.payload
                    };
                }
                return batter;
            });
            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings: {
                        ...currentBattingInning,
                        [inningKeyBatsman]: updatedBatsmanInning
                    }
                }
            }
        case actionTypes.UPDATE_BOWLER_SCORE:
            // console.log("Action: ", action.payload)
            // console.log("State: ", state)
            let inningKeyBowler = String(action.payload.inning_number);
            let currentBowlerInnings = state?.bowlingScore?.innings;
            let bowlerInning = currentBowlerInnings[inningKeyBowler] || [];
            // console.log("Bowler Inning: ", bowlerInning)
 
            const updateBowlerInning = bowlerInning.map(bowler => {
                if(bowler.player.id === action.payload.player.id) {
                    return {
                       ...bowler,
                        ...action.payload
                    }
                }
                return bowler;
            })
            return {
                ...state,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: {
                        ...currentBowlerInnings,
                        [inningKeyBowler]: updateBowlerInning
                    }
                }
            };
        case actionTypes.ADD_BATSMAN:
            let inningKey = String(action.payload.inning_number);
            let currentBatsmanInnings = state?.battingScore?.innings || {};
            let inningBatsmen = currentBatsmanInnings[inningKey] || [];

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
        case actionTypes.ADD_BOWLER:
            let addBowlerInningKey = String(action.payload.inning_number);
            let addBowlerInning = state?.battingScore?.innings || {};
            let inningBowler = addBowlerInning[addBowlerInningKey] || [];

            return {
                ...state,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: {
                        ...addBowlerInning,
                        [addBowlerInningKey]: [...inningBowler, action.payload]
                    }
                }
            };
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
        case actionTypes.ADD_CRICKET_WICKET_FALLEN:
            return {
                ...state,
                wicketFallen: [...state.wicketFallen, action.payload]
            }
        default:
            return state
    }
}

export const selectCurrentBatsmen = (state, inningNumber) => {
    
    if (state.cricketPlayerScore?.currentBatsman?.length > 0) {
        return state.cricketPlayerScore.currentBatsman;
    }
    if (!state.cricketPlayerScore || !state.cricketPlayerScore.battingScore) {
        return [];
    }
    const innings = state.cricketPlayerScore.battingScore.innings;  // Full path: Now safe
    const inningKey = String(inningNumber);
    
    if (!innings || !innings[inningKey]) {
        return [];
    }
    const current = innings[inningKey].filter(b => b.is_currently_batting);
    return current;
    return innings[inningKey].filter(b => b.is_currently_batting);
};

export const selectCurrentBowler = (state, inningNumber) => {
    if (state.cricketPlayerScore?.currentBowler?.length > 0) {
        return state.cricketPlayerScore.currentBowler;
    }

    if (!state?.cricketPlayerScore || !state.cricketPlayerScore.bowlingScore) {
        return null;
    }
    const innings = state.cricketPlayerScore.bowlingScore.innings;  // Full path
    const inningKey = String(inningNumber);
    
    if (!innings || !innings[inningKey]) {
        return null;
    }
    const currentBowlers = innings[inningKey].filter(b => b.is_current_bowler);
    const result = currentBowlers.length > 0 ? currentBowlers : null;
    return result;
};


export default cricketMatchPlayerScoreReducers;
