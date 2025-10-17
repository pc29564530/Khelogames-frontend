import * as actionTypes from '../types/actionTypes';


const initialState = {
   tournamentEntities: []
}

const tournamentEntitiesReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_TOURNAMENT_ENTITIES:
            return {
                ...state,
                tournamentEntities: action.payload
            }
        case actionTypes.ADD_TOURNAMENT_ENTITIES:
            return {
                ...state,
                tournamentEntities: [...state.tournamentEntities, action.payload]
            }
        default:
            return state
    }
}

export default tournamentEntitiesReducers;