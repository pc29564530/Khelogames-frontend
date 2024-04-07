import * as actionTypes from '../types/actionTypes'

const initialState = {
    community: []
}

const communityReducers = (state=initialState, action) => {
    switch (action.type) {
        case actionTypes.COMMUNITY:
            return {
                ...state,
                community:action.payload
            }
        case actionTypes.ADD_COMMUNITY:
            return {
                ...state,
                community:[...state.community, action.payload]
            }
        default:
            return state
    }
}

export default communityReducers;