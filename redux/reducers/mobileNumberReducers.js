import * as actionTypes from '../types/actionTypes';

const initialState = {
    mobileNumber: '',
};

const mobileNumberReducers = async (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_MOBILE_NUMBER:
          return {
            ...state,
            mobileNumber: action.payload,
          };
        default:
          return state;
      }
}

export default mobileNumberReducers;