import * as actionTypes from '../types/actionTypes';

const initialstate = {
    full_name:'',
    description:'',
    avatar_url:''
}

const editProfileReducers = (state=initialstate, action) => {
    switch (action.type) {
        case actionTypes.SET_EDIT_FULL_NAME:
            return {
                ...state,
                full_name: action.payload
            }
        case actionTypes.SET_EDIT_DESCRIPTION:
            return {
                ...state,
                description: [...state.description, action.payload]
            }
        case actionTypes.SET_PROFILE_AVATAR:
            return {
                ...state,
                avatar_url: [...state.avatar_url, action.payload]
            }
        default:
            return state
    }
}

export default editProfileReducers;