import * as actionTypes from '../types/actionTypes';

const initialState = {
    incidents: []
}

const footballIncidentsReducers = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.ADD_FOOTBALL_INCIDENT:
            return {
                ...state,
                incidents: [...state.incidents, action.payload]
            }
        case actionTypes.RESET_FOOTBALL_INCIDENTS:
            return initialState
        case actionTypes.GET_FOOTBALL_INCIDENTS:
            return {
                incidents: action.payload
            }
        default:
            return state
    }
}

export default footballIncidentsReducers;