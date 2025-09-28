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
        case actionTypes.UPDATE_BATSMAN_SCORE:
            let inningKeyBatsman = String(action.payload.inning_number);
            let currentBattingInning = state?.battingScore?.innings;
            let batsmanInning = currentBattingInning[inningKeyBatsman] || [];

            // Create updated inning array
            const updatedBatsmanInning = batsmanInning.map(batter => {
                if (batter.player.id === action.payload.batsman_id) {
                    return {
                        ...batter,
                        runs_scored: action.payload.runs_scored,
                        balls_faced: action.payload.balls_faced,
                        fours: action.payload.fours,
                        sixes: action.payload.sixes,
                        batting_status: action.payload.batting_status,
                        is_striker: action.payload.is_striker,
                        is_currently_batting: action.payload.is_currently_batting
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
            console.log("Action: ", action.payload)
            console.log("State: ", state)
            let inningKeyBowler = String(action.payload.inning_number);
            let currentBowlerInnings = state?.bowlingScore?.innings;
            let bowlerInning = currentBowlerInnings[inningKeyBowler] || [];
            console.log("Bowler Inning: ", bowlerInning)
            const updateBowlerInning = bowlerInning.map(bowler => {
                if(bowler.player.id === action.payload.bowler_id) {
                    return {
                       ...bowler,
                        ball_number: action.payload.ball_number,
                        runs: action.payload.runs,
                        wickets: action.payload.wickets,
                        wide: action.payload.wide,
                        no_ball: action.payload.no_ball,
                        bowling_status: action.payload.bowling_status,
                        is_current_bowler: action.payload.is_current_bowler 
                    }
                }
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
    if (!state?.cricketPlayerScore || !state.cricketPlayerScore.battingScore) {
        return [];
    }
    const innings = state.cricketPlayerScore.battingScore.innings;  // Full path: Now safe
    const inningKey = String(inningNumber);
    
    if (!innings || !innings[inningKey]) {
        return [];
    }
    const current = innings[inningKey].filter(b => b.is_currently_batting);
    return current;
};

export const selectCurrentBowler = (state, inningNumber) => {
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
