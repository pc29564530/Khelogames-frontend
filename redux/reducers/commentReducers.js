import * as actionTypes from '../types/actionTypes';


const initialState = {
   comments: [] 
}

const commentsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_COMMENTS:
            return {
                ...state,
                comments: action.payload
            };
        case actionTypes.ADD_COMMENTS:
            commentData = action.payload;
            return {
                ...state,
                comments: commentData
            }
        default: 
            return state
    }
}

export default commentsReducers;