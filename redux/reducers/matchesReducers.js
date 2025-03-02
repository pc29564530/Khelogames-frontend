import * as actionTypes from '../types/actionTypes';

const initialState = {
        matches: [],
        match: []
}

const  matchesReducers = (state=initialState, action) => {

    switch (action.type) {
        case actionTypes.GET_MATCHES:
            return {
                ...state,
                matches: Array.isArray(action.payload) ? action.payload: [],
            };
        case actionTypes.SET_MATCHES:
            return {
                ...state,
                matches: [...state.matches, action.payload],
            };
        case actionTypes.GET_MATCH:
            return {
                ...state,
                match: action.payload
            }
        default:
            return state;
    }
}

export default matchesReducers;