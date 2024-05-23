import * as actionTypes from '../types/actionTypes';

const initialState = {
    sport: ''
}

const sportReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_SPORT:
            return {
                ...state,
                sport: action.payload
            }
        default:
            return state;
    }
}

export default sportReducers;