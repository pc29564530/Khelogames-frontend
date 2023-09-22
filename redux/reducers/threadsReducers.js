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
        // to work on toggle likes
        // case actionTypes.TOGGLE_LIKES:
        //     const checkLiked = state.threads.map(thread => {
        //         if(thread.id === actionTypes.payload.threadId) {
        //             return {
        //                 ...thread,
        //                 isLikes: action.payload.isLikes
        //             }
        //         }
        //     })
        // case actionTypes.SET_COMMENTS:
        //     const comment = state.comments.map(comment => {
        //         if(comment.thread_id === actionTypes.payload.threadId) {
        //             console.log(comment.thread_id)
        //             console.log(action.payload.threadId)
        //             return {
        //                 ...comment,
        //                 comments: action.payload
        //             }
        //         }
        //         return comment
        //     })
        //     return {
        //         ...state,
        //         comments: comment
        //     }
        default: 
            return state
    }
}

export default threadsReducers;