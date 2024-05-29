import * as actionTypes from '../types/actionTypes';

const initialState = {
    clubs:[]
}

const clubReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_CLUB:
            return {
                ...state,
                clubs: action.payload
            }
        case actionTypes.CREATE_CLUB:
            return {
                ...state,
                clubs: [...state.clubs, action.payload]
            }
        default:
            return state;
    }
}

export default clubReducers;