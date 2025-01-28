import { act } from 'react';
import * as actionTypes from '../types/actionTypes';

const initialstate = {
    cricketPlayerScore: [],
    battingScore: [],
    bowlingScore: [],
    wicketFallen: [],
}

const cricketMatchPlayerScoreReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_BATSMAN_SCORE:
            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings: state.battingScore.innings.map(batter => {
                        if(batter.player.id === action.payload.batsman_id) {
                            return { ...batter,
                                runs_scored: action.payload.runs_scored,
                                balls_faced: action.payload.balls_faced,
                                fours: action.payload.fours,
                                sixes: action.payload.sixes,
                                batting_status: action.payload.batting_status,
                                is_striker: action.payload.is_striker,
                                is_current_batting: action.payload.is_current_batting
                            }
                        }
                        return batter;
                    }),
                }
            };
        case actionTypes.UPDATE_BOWLER_SCORE:
            return {
                ...state,
                bowlingScore:{
                    ...state.bowlingScore,
                    innings: state.bowlingScore.innings.map(bowler => {
                        if(bowler.player.id === action.payload.bowler_id){
                            return {
                                ...bowler,
                                ball: action.payload.ball,
                                runs: action.payload.runs,
                                wickets: action.payload.wickets,
                                wide: action.payload.wide,
                                no_ball: action.payload.no_ball,
                                batting_status: action.payload.batting_status,
                                is_current_bowler: action.payload.is_current_bowler
                            }
                        }
                        return bowler
                    }),
                }
            }
        case actionTypes.ADD_BATSMAN:
            return {
                ...state,
                battingScore: {
                    ...state.battingScore,
                    innings: [...state.battingScore.innings, action.payload],
                }
            }
        case actionTypes.ADD_BOWLER:
            return {
                ...state,
                bowlingScore: {
                    ...state.bowlingScore,
                    innings: [...state.bowlingScore.innings, action.payload],
                }
            }
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
        default:
            return state
    }
}

export default cricketMatchPlayerScoreReducers;
