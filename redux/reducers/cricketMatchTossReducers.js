import * as actionTypes from '../types/actionTypes';


const initialState = {
   cricketToss: null
}

const cricketTossReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_CRICKET_TOSS:
            return {
                ...state,
                cricketToss: action.payload
            };
        default: 
            return state
    }
}

export default cricketTossReducers;