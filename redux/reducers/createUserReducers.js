import * as actionTypes from '../types/actionTypes';

const initialState = {
    mobileNumber: '',
}

const createUserReducers = (state=initialState, action) => {
    switch(action.type) {
        case actionTypes.CREATE_USER:
            return {
                ...state,
                mobileNumber: action.payload,
            }
        default:
            return state;
    }
}

export default createUserReducers;