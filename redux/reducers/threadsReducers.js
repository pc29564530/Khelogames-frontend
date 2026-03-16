import * as actionTypes from '../types/actionTypes';


const initialState = {
   threads: []
}

const threadsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_THREADS:
            return {
                ...state,
                threads: Array.isArray(action.payload) ? action.payload : [],
            };
        case actionTypes.SET_LIKES:
            const threadPublicID = action.payload.threadPublicID;
            const newLikesCount = action.payload.newLikesCount;
            const updateLikes = state.threads.map(thread => {
                if(thread.public_id === threadPublicID) {
                   return {
                    ...thread,
                    like_count: newLikesCount,
                   };
                }
                return thread;
            })
            return {
                ...state,
                threads: updateLikes,
            }
        case actionTypes.ADD_THREADS:
            const newItems = Array.isArray(action.payload) ? action.payload : [action.payload];
            return {
                ...state,
                threads: [...state.threads, ...newItems]
            }
        default:
            return state
    }
}

export default threadsReducers;