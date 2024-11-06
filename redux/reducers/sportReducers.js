import * as actionTypes from '../types/actionTypes';

const initialState = {
    games: [],
    game: { id: 1, name: 'football', min_players: 11}
}

const sportReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_GAMES:
            return {
                ...state,
                games: action.payload
            }
        case actionTypes.SET_GAME:
            return {
                ...state,
                game:action.payload
            }
        default:
            return state;
    }
}

export default sportReducers;