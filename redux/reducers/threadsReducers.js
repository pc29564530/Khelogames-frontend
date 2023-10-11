import * as actionTypes from '../types/actionTypes';


const initialState = {
   threads: []
}

const threadsReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_THREADS:
            return {
                ...state,
                threads: action.payload 
            }
        case actionTypes.SET_LIKES:
            const threadId = action.payload.threadId;
            const newLikesCount = action.payload.newLikesCount;

            const updateLikes = state.threads.map(thread => {
                if(thread.id === threadId) {
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
        // to be implemented likes array size instead of count that will contain the username only one user can like at one time a post
        default: 
            return state
    }
}

export default threadsReducers;