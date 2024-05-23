import * as actionTypes from '../types/actionTypes';


const initialState = {
   tournaments: [],
   tournament:[]
}

const tournamentsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_TOURNAMENT_BY_SPORT:
            return {
                ...state,
                tournaments: action.payload
            }
        case actionTypes.GET_TOURNAMENT_BY_ID:
            return {
                ...state,
                tournament: action.payload
            }
        default:
            return state
    }
}

export default tournamentsReducers;