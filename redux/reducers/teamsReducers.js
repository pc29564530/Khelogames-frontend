import * as actionTypes from '../types/actionTypes';

const initialState = {
    teams: [],
    teamsBySports: [],
    homePlayer: [],
    awayPlayer: []
}

const teamsReducers = (state=initialState, action) => {
    switch(action.type) {
        case actionTypes.SET_TEAMS:
            return {
                ...state,
                teams: [...state.teams, action.payload]
            }
        case actionTypes.GET_TEAMS:
            return {
                ...state,
                teams: action.payload
            }
        case actionTypes.GET_TEAMS_BY_SPORT:
            return {
                ...state,
                teamsBySports: action.payload
            }
        case actionTypes.GET_HOME_PLAYER:
            return {
                ...state,
                homePlayer: action.payload
            }
        case actionTypes.GET_AWAY_PLAYER:
            return {
                ...state,
                awayPlayer: action.payload
            }
        default:
            return state;
    }
}

export default teamsReducers;