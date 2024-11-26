import * as actionTypes from '../types/actionTypes';



const initialState = {
        players: []
}

const  teamPlayerReducers = (state=initialState, action) => {

    switch (action.type) {
        case actionTypes.GET_TEAM_PLAYERS:
            return {
                ...state,
                players: Array.isArray(action.payload) ? action.payload: [],
            };
        case actionTypes.SET_TEAM_PLAYER:
            return {
                ...state,
                players: [...state.players, action.payload],
            };
        default:
            return state;
    }
}

export default teamPlayerReducers;