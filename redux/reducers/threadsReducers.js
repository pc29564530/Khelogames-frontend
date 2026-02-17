import * as actionTypes from '../types/actionTypes';


const initialState = {
   threads: []
}

const threadsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_THREADS:
            return {
                ...state,
                threads: action.payload,
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
            return {
                ...state,
                threads: [...state.threads, action.payload]
            }
        default:
            return state
    }
}

export default threadsReducers;