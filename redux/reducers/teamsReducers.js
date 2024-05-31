import * as actionTypes from '../types/actionTypes';

const initialState = {
    teams: []
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
        default:
            return state;
    }
}

export default teamsReducers;