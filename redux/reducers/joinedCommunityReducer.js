import * as actionTypes from '../types/actionTypes';



const initialState = {
    joinedCommunity:[]
}

const  joinedCommunityReducer = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes?.JOINED_COMMUNITY:
            return {
                ...state,
                joinedCommunity: action.payload
            }
        case actionTypes.ADD_JOINED_COMMUNITY:
            return {
                ...state,
                joinedCommunity: [...state.joinedCommunity, action.payload]
            }
        default:
            return state
    }
}

export default joinedCommunityReducer;