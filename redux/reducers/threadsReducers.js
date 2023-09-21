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
            return {
                ...state,
                threads: state.threads.map(thread => {
                    if(thread._id === action.threadId) {
                        return {
                            ...thread,
                            likes: !!thread.likes ? thread.likes.concat(thread.userId) : [action.userId]
                        }
                    }
                    return thread
                })
            }
        case actionTypes.SET_UNLINKES:
            return {
                ...state,
                threads: state.threads.map(thread => {
                    if(thread._id === action.threadId) {
                        return {
                            ...thread,
                            likes: thread.likes.filter(userId => userId !== action.userId)
                        }
                    }
                    return thread
                })
            }
        default: 
            return state

    }
}

export default threadsReducers;