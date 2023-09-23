import * as actionTypes from '../types/actionTypes';


const initialState = {
   comments: [],
   commentText: ''
}

const commentsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_COMMENTS:
            return {
                ...state,
                comments: action.payload
            };
        case actionTypes.ADD_COMMENTS:
            return {
                ...state,
                comments: [...state.comments, action.payload]
            }
        case actionTypes.SET_COMMENT_TEXT:
            return {
                ...state,
                commentText: action.payload
            }
        default: 
            return state
    }
}

export default commentsReducers;